// Import React and hooks for managing refs, effects, and memoization
import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

// Define a pleasing color palette (optional, but helps visual coherence)
const colorPalette = [
  '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f',
  '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'
];

// Function to get a deterministic color based on node ID
const getNodeColor = (nodeId) => {
  // Simple hash function to map nodeId to a color index
  let hash = 0;
  for (let i = 0; i < nodeId.length; i++) {
    const char = nodeId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // Use the hash to select a color from the palette
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
};

// Main KnowledgeGraph component for rendering the force-directed graph
const KnowledgeGraph = ({
    graphData,                  // Graph data: { nodes, links }
    onNodeSelect, selectedNode, // Node selection handlers and state
    onLinkSelect, selectedLink, // Link selection handlers and state
    onNodeDoubleClick,          // Handler for node double-click
    onLinkDoubleClick,          // Handler for link double-click
    selectingNodeFor, onNodeSelectedForEdge, // Edge creation selection state/handler
    onBackgroundClick           // Handler for background click
}) => {
  // Ref to the ForceGraph2D component for direct access if needed
  const fgRef = useRef();

  // --- Pre-calculate parallel edges for curvature ---
  // Memoize calculation of link curvature for parallel edges
  // This ensures that multiple links between the same pair of nodes are visually separated
  const linkParallelismData = useMemo(() => {
    const counts = {}; // Store counts and indices for each pair
    const linkData = {}; // Store calculated curvature per link ID

    // Identify parallel links (regardless of direction)
    graphData.links.forEach(link => {
      // Normalize node IDs to handle object/string cases and direction independence
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      const pairKey = [sourceId, targetId].sort().join('<=>'); // Create a unique key for the pair

      if (!counts[pairKey]) {
        counts[pairKey] = [];
      }
      counts[pairKey].push(link.id); // Store link ID in the group
    });

    // Calculate curvature for each link in a group of parallel links
    Object.values(counts).forEach(linkIdsInGroup => {
        const numLinks = linkIdsInGroup.length;
        if (numLinks <= 1) return; // No curvature needed for single links

        const maxCurvature = 0.6; // Max curvature amount
        const step = maxCurvature / Math.max(1, numLinks - 1); // Distribute curvature

        linkIdsInGroup.forEach((linkId, index) => {
            // Calculate curvature: 0 for the middle link(s), increasing outwards
            const curvature = (index - (numLinks - 1) / 2) * step;
            linkData[linkId] = curvature;
        });
    });

    return linkData; // { linkId1: curvature1, linkId2: curvature2, ... }
  }, [graphData.links]); // Recalculate only when links change

  // Custom node rendering function for canvas
  // Draws the node as a colored circle and its label below
  const drawNode = (node, ctx, globalScale) => {
    const label = node.label || 'Unknown';
    const fontSize = 12 / globalScale;
    const nodeRadius = 6;
    const isSelected = selectedNode && selectedNode.id === node.id;

    // Draw circle with color based on node ID
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = getNodeColor(node.id);
    ctx.fill();
    
    // Draw highlight if selected
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius + 2 / globalScale, 0, 2 * Math.PI, false);
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }

    // Draw label with improved styling
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

  // Custom link rendering function for canvas (for labels and selection highlight)
  // Draws the label and highlights the link if selected
  const drawLink = useCallback((link, ctx, globalScale) => {
    const label = link.label || '';
    if (!label) return; // Skip rendering if there's no label
    
    const isSelected = selectedLink && selectedLink.id === link.id;
    const start = link.source;
    const end = link.target;
    if (typeof start !== 'object' || typeof end !== 'object' || !start.hasOwnProperty('x') || !end.hasOwnProperty('x')) return; 

    const startX = start.x;
    const startY = start.y;
    const endX = end.x;
    const endY = end.y;

    // Get curvature for this specific link
    const curvature = linkParallelismData[link.id] || 0;

    // Calculate control points for quadratic Bezier curve
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const normalX = endY - startY;
    const normalY = startX - endX;
    const normalLen = Math.sqrt(normalX * normalX + normalY * normalY);

    // If the link is a self-loop or has no length, just draw the label above the node
    if (normalLen === 0) {
        ctx.font = `bold ${10 / globalScale}px Sans-Serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillText(label, startX, startY - 7 / globalScale);
        return;
    }

    // Calculate the control point for the curve based on curvature
    const normNormalX = normalX / normalLen;
    const normNormalY = normalY / normalLen;
    const controlPointOffset = curvature * 40;
    const ctrlX = midX + normNormalX * controlPointOffset;
    const ctrlY = midY + normNormalY * controlPointOffset;
    // Calculate the position for the label along the curve
    const curveMidX = (startX + 2 * ctrlX + endX) / 4;
    const curveMidY = (startY + 2 * ctrlY + endY) / 4;

    // We're removing the edge drawing code from here - the ForceGraph2D component will draw the edges
    // Only draw highlight for selected edges
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

    // Label drawing with improved styling
    const fontSize = 10 / globalScale;
    ctx.font = `bold ${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calculate the angle for the label so it follows the curve
    const angle = Math.atan2(curveMidY - startY, curveMidX - startX);
    const adjustedAngle = angle > Math.PI / 2 || angle < -Math.PI / 2 ? angle + Math.PI : angle;

    ctx.save();
    ctx.translate(curveMidX, curveMidY);
    ctx.rotate(adjustedAngle);

    // Draw a white background rectangle for the label for better readability
    const textWidth = ctx.measureText(label).width;
    const padding = 2 / globalScale;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(-textWidth / 2 - padding, -fontSize / 2 - padding, textWidth + padding * 2, fontSize + padding * 2);
    
    ctx.fillStyle = '#000';
    ctx.fillText(label, 0, 0);

    ctx.restore();
  }, [linkParallelismData, selectedLink]);

  // --- Click handling logic for single/double click on nodes and links ---
  // These timers help distinguish between single and double clicks
  let nodeClickTimer = null;
  let lastNodeClicked = null;
  let linkClickTimer = null;
  let lastLinkClicked = null;

  // Handle node click: select, double-click, or select for edge creation
  const handleNodeClick = useCallback((node) => {
    // If in edge creation mode, select the node for the edge
    if (selectingNodeFor) {
      onNodeSelectedForEdge(node);
      if (nodeClickTimer) clearTimeout(nodeClickTimer); nodeClickTimer = null; lastNodeClicked = null;
      return;
    }

    // Handle double-click vs single-click
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

  // Handle link click: select or double-click
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

  // Style to make this component fill its parent container
  const graphContainerStyle = {
    width: '100%',
    height: '100%',
    position: 'relative',
  };
  
  // Status message when there's no data
  const emptyGraphMessage = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#666',
    fontSize: '1.2em',
    textAlign: 'center',
  };

  // Optional: Style for graph when selecting a node for edge creation
  const selectingGraphStyle = selectingNodeFor ? { cursor: 'crosshair' } : {};

  // Render the graph or a message if there are no nodes
  return (
    <div style={{ ...graphContainerStyle, ...selectingGraphStyle }}> {/* Apply cursor style */}
      {graphData.nodes.length === 0 ? (
        <div style={emptyGraphMessage}>
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
        linkDirectionalArrowRelPos={0.5} // Position arrow at the middle of the edge
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

// Export the KnowledgeGraph component as default
export default KnowledgeGraph;
