import { useEffect, useRef, useMemo } from 'react';
import G6 from '@antv/g6';
// import type { Graph } from '@antv/g6';

function refreshDragedNodePosition(e: any) {
  const model = e.item.get('model');
  model.fx = e.x;
  model.fy = e.y;
}

export type SourceTargetMapType = { source: string, target: string };
export type NodeType = { id: string, size: number, isLeaf: boolean };

const fittingString = (str: string, maxWidth: number, fontSize: number) => {
  let currentWidth = 0;
  let res = str;
  const pattern = new RegExp('[\u4E00-\u9FA5]+'); // distinguish the Chinese charactors and letters
  str.split('').forEach((letter, i) => {
    if (currentWidth > maxWidth) return;
    if (pattern.test(letter)) {
      // Chinese charactors
      currentWidth += fontSize;
    } else {
      // get the width of single letter according to the fontSize
      currentWidth += G6.Util.getLetterWidth(letter, fontSize);
    }
    if (currentWidth > maxWidth) {
      res = `${str.substr(0, i)}\n${str.substr(i)}`;
    }
  });
  return res;
};

const globalFontSize = 12;

export default function Graph({ nodes, edges }: { nodes: { id: string, size: number }[]; edges: { source: string, target: string }[] }) {
  const containerRef: any = useRef(null);
  let graph: any = null;

  useEffect(() => {
    if (!graph) {
      const width = containerRef.current?.scrollWidth || 500;
      const height = containerRef.current?.scrollHeight || 500;

      // eslint-disable-next-line react-hooks/exhaustive-deps
      graph = new G6.Graph({
        container: containerRef.current,
        width,
        height,
        layout: {
          type: 'force',
          preventOverlap: true,
          // linkDistance: (d: { source: { id: string; }; }) => {
          //   if (d.source.id === 'node0') {
          //     return 100;
          //   }
          //   return 30;
          // },
          linkDistance: (d: { source: { id: string; }; }) => {
            return 300;
          },
          nodeStrength: (d: { isLeaf: any; }) => {
            if (d.isLeaf) {
              return -50;
            }
            return -10;
          },
          edgeStrength: (d: { source: { id: string; }; }) => {
            if (d.source.id === 'node1' || d.source.id === 'node2' || d.source.id === 'node3') {
              return 0.7;
            }
            return 0.1;
          },
        },
        defaultNode: {
          color: '#5B8FF9',
        },
        modes: {
          default: ['drag-canvas', 'activate-relations'],
        },
      });

      graph.data({
        nodes: nodes.map(item => ({ ...item, label: fittingString(item.id, item.size, globalFontSize) })),
        edges: edges.map(function (edge: any, i) {
          edge.id = 'edge' + i;
          return Object.assign({}, {
            ...edge,
            style: {
              endArrow: true,
            },
          });
        }),
      });
      graph.render();

      graph.on('node:dragstart', function (e: any) {
        graph.layout();
        refreshDragedNodePosition(e);
      });

      graph.on('node:drag', function (e: any) {
        refreshDragedNodePosition(e);
      });

      graph.on('node:dragend', function (e: any) {
        e.item.get('model').fx = null;
        e.item.get('model').fy = null;
      });

      graph.on('node:mouseenter', (e: { item: any; }) => {
        graph.setItemState(e.item, 'active', true);
      });

      graph.on('node:mouseleave', (e: { item: any; }) => {
        graph.setItemState(e.item, 'active', false);
      });

      graph.on('nodeselectchange', (e: { selectedItems: any; select: any; }) => {
        console.log(e.selectedItems, e.select);
      });
    }

  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined')
      window.onresize = () => {
        if (!graph || graph.get('destroyed')) return;
        if (!containerRef.current || !containerRef.current.scrollWidth || !containerRef.current.scrollHeight) return;
        graph.changeSize(containerRef.current.scrollWidth, containerRef.current.scrollHeight);
      };
  }, []);

  return (<div ref={containerRef} className="w-full h-full" />);
};
