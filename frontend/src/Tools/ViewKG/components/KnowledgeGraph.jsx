import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const colorPalette = [
  '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f',
  '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'
];

const getNodeColor = (nodeId) => {
  let hash = 0;
  for (let i = 0; i < nodeId.length; i++) {
    const char = nodeId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
};

const KnowledgeGraph = ({
  graphData,
  onNodeSelect, selectedNode,
  onLinkSelect, selectedLink,
  onNodeDoubleClick,
  onLinkDoubleClick,
  selectingNodeFor, onNodeSelectedForEdge,
  onBackgroundClick
}) => {
  const fgRef = useRef();

  const linkParallelismData = useMemo(() => {
    const counts = {};
    const linkData = {};

    graphData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      const pairKey = [sourceId, targetId].sort().join('<=>');

      if (!counts[pairKey]) {
        counts[pairKey] = [];
      }
      counts[pairKey].push(link.id);
    });

    Object.values(counts).forEach(linkIdsInGroup => {
      const numLinks = linkIdsInGroup.length;
      if (numLinks <= 1) return;

      const maxCurvature = 0.6;
      const step = maxCurvature / Math.max(1, numLinks - 1);

      linkIdsInGroup.forEach((linkId, index) => {
        const curvature = (index - (numLinks - 1) / 2) * step;
        linkData[linkId] = curvature;
      });
    });

    return linkData;
  }, [graphData.links]);

  const drawNode = (node, ctx, globalScale) => {
    const label = node.label || 'Unknown';
    const fontSize = 12 / globalScale;
    const nodeRadius = 6;
    const isSelected = selectedNode && selectedNode.id === node.id;

    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = getNodeColor(node.id);
    ctx.fill();

    if (isSelected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius + 2 / globalScale, 0, 2 * Math.PI, false);
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }

    ctx.font = `bold ${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 2;
    ctx.fillText(label, node.x, node.y + nodeRadius + fontSize);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  };

  const drawLink = useCallback((link, ctx, globalScale) => {
    const label = link.label || '';
    if (!label) return;

    const isSelected = selectedLink && selectedLink.id === link.id;
    const start = link.source;
    const end = link.target;
    if (typeof start !== 'object' || typeof end !== 'object' || !start.hasOwnProperty('x') || !end.hasOwnProperty('x')) return;

    const startX = start.x;
    const startY = start.y;
    const endX = end.x;
    const endY = end.y;

    const curvature = linkParallelismData[link.id] || 0;

    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const normalX = endY - startY;
    const normalY = startX - endX;
    const normalLen = Math.sqrt(normalX * normalX + normalY * normalY);

    if (normalLen === 0) {
      ctx.font = `bold ${10 / globalScale}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillText(label, startX, startY - 7 / globalScale);
      return;
    }

    const normNormalX = normalX / normalLen;
    const normNormalY = normalY / normalLen;
    const controlPointOffset = curvature * 40;
    const ctrlX = midX + normNormalX * controlPointOffset;
    const ctrlY = midY + normNormalY * controlPointOffset;
    const curveMidX = (startX + 2 * ctrlX + endX) / 4;
    const curveMidY = (startY + 2 * ctrlY + endY) / 4;

    if (isSelected) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      if (curvature === 0) {
        ctx.lineTo(endX, endY);
      } else {
        ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
      }
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.lineWidth = 3 / globalScale;
      ctx.stroke();
      ctx.restore();
    }

    const fontSize = 10 / globalScale;
    ctx.font = `bold ${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const angle = Math.atan2(curveMidY - startY, curveMidX - startX);
    const adjustedAngle = angle > Math.PI / 2 || angle < -Math.PI / 2 ? angle + Math.PI : angle;

    ctx.save();
    ctx.translate(curveMidX, curveMidY);
    ctx.rotate(adjustedAngle);

    const textWidth = ctx.measureText(label).width;
    const padding = 2 / globalScale;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(-textWidth / 2 - padding, -fontSize / 2 - padding, textWidth + padding * 2, fontSize + padding * 2);

    ctx.fillStyle = '#000';
    ctx.fillText(label, 0, 0);

    ctx.restore();
  }, [linkParallelismData, selectedLink]);

  let nodeClickTimer = null;
  let lastNodeClicked = null;
  let linkClickTimer = null;
  let lastLinkClicked = null;

  const handleNodeClick = useCallback((node) => {
    if (selectingNodeFor) {
      onNodeSelectedForEdge(node);
      if (nodeClickTimer) clearTimeout(nodeClickTimer); nodeClickTimer = null; lastNodeClicked = null;
      return;
    }

    if (nodeClickTimer) { clearTimeout(nodeClickTimer); nodeClickTimer = null; }
    if (lastNodeClicked && lastNodeClicked.id === node.id && (new Date() - lastNodeClicked.clickTime) < 300) {
      if (onNodeDoubleClick) onNodeDoubleClick(node);
      lastNodeClicked = null;
    } else {
      lastNodeClicked = { id: node.id, clickTime: new Date() };
      nodeClickTimer = setTimeout(() => {
        onNodeSelect(node);
        lastNodeClicked = null; nodeClickTimer = null;
      }, 300);
    }
  }, [onNodeSelect, onNodeDoubleClick, selectingNodeFor, onNodeSelectedForEdge]);

  const handleLinkClick = useCallback((link) => {
    if (linkClickTimer) { clearTimeout(linkClickTimer); linkClickTimer = null; }

    if (lastLinkClicked && lastLinkClicked.id === link.id && (new Date() - lastLinkClicked.clickTime) < 300) {
      if (onLinkDoubleClick) onLinkDoubleClick(link);
      lastLinkClicked = null;
    } else {
      lastLinkClicked = { id: link.id, clickTime: new Date() };
      linkClickTimer = setTimeout(() => {
        if (onLinkSelect) onLinkSelect(link);
        lastLinkClicked = null; linkClickTimer = null;
      }, 300);
    }
  }, [onLinkSelect, onLinkDoubleClick]);

  return (
    <div className={`w-full h-full relative ${selectingNodeFor ? 'cursor-crosshair' : ''}`}>
      {graphData.nodes.length === 0 ? (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-600 text-lg text-center">
          No nodes yet. Click "Add Node" to create one.
        </div>
      ) : (
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeRelSize={6}
          nodeLabel={node => `${node.label || 'Unknown'} (${node.id})`}
          nodeCanvasObject={drawNode}
          nodeCanvasObjectMode={() => 'after'}
          linkLabel={link => link.label || ''}
          linkColor={() => 'rgba(0,0,0,0.3)'}
          linkWidth={link => (selectedLink && selectedLink.id === link.id ? 3 : 2)}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={0.5}
          linkCurvature={link => linkParallelismData[link.id] || 0}
          linkCanvasObject={drawLink}
          linkCanvasObjectMode={() => 'after'}
          onNodeClick={handleNodeClick}
          onLinkClick={handleLinkClick}
          onBackgroundClick={onBackgroundClick}
          onNodeDragEnd={node => {
            node.fx = node.x;
            node.fy = node.y;
          }}
          cooldownTicks={100}
        />
      )}
    </div>
  );
};

export default KnowledgeGraph;