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

const data = {
  nodes: [
    // { id: 'node0', size: 50 },
    // { id: 'node1', size: 30 },
    // { id: 'node2', size: 30 },
    // { id: 'node3', size: 30 },
    // { id: 'node4', size: 30, isLeaf: true },
    // { id: 'node5', size: 30, isLeaf: true },
    // { id: 'node6', size: 15, isLeaf: true },
    // { id: 'node7', size: 15, isLeaf: true },
    // { id: 'node8', size: 15, isLeaf: true },
    // { id: 'node9', size: 15, isLeaf: true },
    // { id: 'node10', size: 15, isLeaf: true },
    // { id: 'node11', size: 15, isLeaf: true },
    // { id: 'node12', size: 15, isLeaf: true },
    // { id: 'node13', size: 15, isLeaf: true },
    // { id: 'node14', size: 15, isLeaf: true },
    // { id: 'node15', size: 15, isLeaf: true },
    // { id: 'node16', size: 15, isLeaf: true },
    { id: 'node0', size: 50 },
    { id: 'node1', size: 30 },
    { id: 'node2', size: 30 },
    { id: 'node3', size: 30 },
    { id: 'node4', size: 30,  },
    { id: 'node5', size: 30, },
    { id: 'node6', size: 15,},
    { id: 'node7', size: 15, },
    { id: 'node8', size: 15,  },
    { id: 'node9', size: 15, },
    { id: 'node10', size: 15, },
    { id: 'node11', size: 15, },
    { id: 'node12', size: 15, },
    { id: 'node13', size: 15, },
    { id: 'node14', size: 15,},
    { id: 'node15', size: 15, },
    { id: 'node16', size: 15, },
  ],
  edges: [
    { source: 'node0', target: 'node1' },
    { source: 'node0', target: 'node2' },
    { source: 'node0', target: 'node3' },
    { source: 'node0', target: 'node4' },
    { source: 'node0', target: 'node5' },
    { source: 'node1', target: 'node6' },
    { source: 'node1', target: 'node7' },
    { source: 'node2', target: 'node8' },
    { source: 'node2', target: 'node9' },
    { source: 'node2', target: 'node10' },
    { source: 'node2', target: 'node11' },
    { source: 'node2', target: 'node12' },
    { source: 'node2', target: 'node13' },
    { source: 'node3', target: 'node14' },
    { source: 'node3', target: 'node15' },
    { source: 'node3', target: 'node16' },
  ],
};

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
            return 200;
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
          default: ['drag-canvas'],
        },
      });

      graph.data({
        nodes: nodes,
        edges: edges.map(function (edge: any, i) {
          edge.id = 'edge' + i;
          return Object.assign({}, edge);
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
      
      // graph.on('node:click', function (e: any) {
      //   // e.item.get('model').fx = null;
      //   // e.item.get('model').fy = null;
      //   console.log(e);
      // });
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
