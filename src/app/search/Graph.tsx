import { useEffect, useRef, useMemo } from 'react';
import G6 from '@antv/g6';
import { SquareChevronLeftIcon } from 'lucide-react';
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

type GraphPropsType = { nodes: { id: string, size: number }[]; edges: { source: string, target: string }[] } & {
  onHover: (name: string, type: 'enter' | 'leave') => void;
  hoveredItem: string;
};

export default function Graph({ nodes, edges, onHover, hoveredItem }: GraphPropsType) {
  const containerRef: any = useRef(null);
  const graphRef: any = useRef(null);

  useEffect(() => {
    if (!graphRef.current) {
      const width = containerRef.current?.scrollWidth || 500;
      const height = containerRef.current?.scrollHeight || 500;

      // eslint-disable-next-line react-hooks/exhaustive-deps
      graphRef.current = new G6.Graph({
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

      graphRef.current.data({
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

      graphRef.current.render();

      graphRef.current.on('node:dragstart', function (e: any) {
        graphRef.current.layout();
        refreshDragedNodePosition(e);
      });

      graphRef.current.on('node:drag', function (e: any) {
        refreshDragedNodePosition(e);
      });

      graphRef.current.on('node:dragend', function (e: any) {
        e.item.get('model').fx = null;
        e.item.get('model').fy = null;
      });

      graphRef.current.on('node:mouseenter', (e: { item: any; }) => {
        graphRef.current.setItemState(e.item, 'active', true);
        onHover(e.item._cfg.id, 'enter');
      });

      graphRef.current.on('node:mouseleave', (e: { item: any; }) => {
        graphRef.current.setItemState(e.item, 'active', false);
        onHover(e.item._cfg.id, 'leave');
      });

      // graph.on('nodeselectchange', (e: { selectedItems: any; select: any; }) => {
      //   console.log(e.selectedItems, e.select);
      // });
    }

  }, [edges, nodes, onHover]);

  console.log(graphRef.current);


  useEffect(() => {
    if (hoveredItem) {
      graphRef.current?.setItemState(hoveredItem, 'active', true);
    }
  }, [hoveredItem]);

  useEffect(() => {
    if (typeof window !== 'undefined')
      window.onresize = () => {
        if (!graphRef.current || graphRef.current?.get('destroyed')) return;
        if (!containerRef.current || !containerRef.current.scrollWidth || !containerRef.current.scrollHeight) return;
        graphRef.current.changeSize(containerRef.current.scrollWidth, containerRef.current.scrollHeight);
      };
  }, []);

  return (<div ref={containerRef} className="w-full h-full" />);
};
