import React, { useState, useRef, useEffect } from "react";
import KnowledgeGraph from "./components/KnowledgeGraph";
import Navbar from "./components/Navbar";
import NodeDialog from "./components/NodeDialog";
import EdgeDialog from "./components/EdgeDialog";
import { generateLpgSchema, downloadJson } from "./utils/KGExportParser";

const KgDisplay = ({ onBack, kg }) => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [visibleNavbarHeight, setVisibleNavbarHeight] = useState(0);
  const navbarRef = useRef(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const [nodeToEdit, setNodeToEdit] = useState(null);
  const [showEdgeDialog, setShowEdgeDialog] = useState(false);
  const [edgeFormData, setEdgeFormData] = useState({ source: null, target: null });
  const [selectingNodeFor, setSelectingNodeFor] = useState(null);
  const [edgeToEdit, setEdgeToEdit] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [isLoadingGraph, setIsLoadingGraph] = useState(true);
  const [graphLoadError, setGraphLoadError] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [clearStatus, setClearStatus] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  function parseJsonSchema(kg) {
    
    if(typeof kg === "string"){
      try {
        kg = JSON.parse(kg);
      } catch (error) {
        console.error("Error parsing KG JSON string:", error);
        return { nodes: [], links: [] };
      }
    }
    
    const jsonData = kg;
    const result = {
      nodes: [],
      links: []
    };
    
    if (jsonData.entities) {
      for (const [id, entity] of Object.entries(jsonData.entities)) {
        result.nodes.push({
          id: id,
          label: entity.type,
          properties: { ...entity },
        });
      }
    }
    
    if (jsonData.predicates) {
      for (const [id, predicate] of Object.entries(jsonData.predicates)) {
        result.links.push({
          id: `link_${id}`,
          source: predicate.subject,
          target: predicate.object,
          label: predicate.type,
          attributes: predicate.attributes || {},
        });
      }
    }
    return result;
  }

  useEffect(() => {
    const measureAndUpdateHeight = () => {
      if (navbarRef.current) {
        const currentHeight = navbarRef.current.offsetHeight;
        if (currentHeight > 0 && currentHeight !== visibleNavbarHeight) {
          setVisibleNavbarHeight(currentHeight);
        }
      }
    };

    if (isNavbarVisible) {
      measureAndUpdateHeight();
      const timeoutId = setTimeout(measureAndUpdateHeight, 370);
      return () => clearTimeout(timeoutId);
    }
  }, [isNavbarVisible]);

  const toggleNavbar = () => {
    setIsNavbarVisible(!isNavbarVisible);
  };

  const handleAddNodeClick = () => {
    setNodeToEdit(null);
    setShowNodeDialog(true);
  };

  const handleEditNodeDoubleClick = (node) => {
    setNodeToEdit(node);
    setShowNodeDialog(true);
  };

  const handleCloseDialog = () => {
    setShowNodeDialog(false);
    setNodeToEdit(null);
  };

  const handleSaveNode = (updatedNode, isEditing) => {
    if (isEditing) {
      setGraphData(prevData => {
        const updatedNodes = prevData.nodes.map(node =>
          node.id === updatedNode.id ? updatedNode : node
        );
        const updatedLinks = prevData.links.map(link => {
          const newLink = { ...link };
          if (typeof link.source === 'object' && link.source.id === updatedNode.id) {
            newLink.source = updatedNode;
          }
          if (typeof link.target === 'object' && link.target.id === updatedNode.id) {
            newLink.target = updatedNode;
          }
          return newLink;
        });
        return {
          nodes: updatedNodes,
          links: updatedLinks
        };
      });
    } else {
      setGraphData(prevData => ({
        ...prevData,
        nodes: [...prevData.nodes, updatedNode]
      }));
    }
    setShowNodeDialog(false);
    setNodeToEdit(null);
  };

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    setSelectedLink(null);
  };

  const handleLinkSelect = (link) => {
    setSelectedLink(link);
    setSelectedNode(null);
  };

  const handleBackgroundClick = () => {
    setSelectedNode(null);
    setSelectedLink(null);
    if (selectingNodeFor) {
      setSelectingNodeFor(null);
    }
  };






  const handleEditEdgeDoubleClick = (edge) => {
    const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
    const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
    setEdgeToEdit(edge);
    setEdgeFormData({ source: sourceId, target: targetId });
    setSelectingNodeFor(null);
    setShowEdgeDialog(true);
    setSelectedNode(null);
    setSelectedLink(null);
  };

  const handleCloseEdgeDialog = () => {
    setShowEdgeDialog(false);
    setSelectingNodeFor(null);
    setEdgeFormData({ source: null, target: null });
    setEdgeToEdit(null);
  };

  const handleStartSelectingNode = (type) => {
    if (!edgeToEdit) {
      setSelectingNodeFor(type);
    }
  };

  const handleNodeSelectedForEdge = (selectedGraphNode) => {
    if (!selectingNodeFor || !selectedGraphNode || edgeToEdit) return;
    setEdgeFormData(prevData => ({
      ...prevData,
      [selectingNodeFor]: selectedGraphNode.id
    }));
    setSelectingNodeFor(null);
  };

  const handleSaveEdge = (edgeDataFromDialog, isEditing) => {
    if (isEditing) {
      setGraphData(prevData => ({
        ...prevData,
        links: prevData.links.map(link =>
          link.id === edgeDataFromDialog.id ? edgeDataFromDialog : link
        )
      }));
    } else {
      const newEdge = {
        ...edgeDataFromDialog,
        source: edgeFormData.source || edgeDataFromDialog.source,
        target: edgeFormData.target || edgeDataFromDialog.target,
      };
      setGraphData(prevData => ({
        ...prevData,
        links: [...prevData.links, newEdge]
      }));
    }
    handleCloseEdgeDialog();
  };

  const handleExportJson = () => {
    try {
      const schema = generateLpgSchema(graphData);
      downloadJson(schema, 'graph-lpg-schema.json');
    } catch (error) {
      console.error("Error generating or downloading schema:", error);
    }
  };


  useEffect(() => {
    const loadGraphData = async () => {
      setIsLoadingGraph(true);
      setGraphLoadError(null);
      try {
        const { nodes, links } = parseJsonSchema(kg);
        setGraphData({ nodes, links });
        console.log("Loaded graph data:", { nodes, links });
      }
      catch (error) {
        setGraphLoadError("Failed to load graph data: " + error.message);
      } finally {
        setIsLoadingGraph(false);
      }
    };
    loadGraphData();
  }, [kg]);



  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar
        ref={navbarRef}
        isVisible={isNavbarVisible}
        onExportJson={handleExportJson}
        isSaving={isSaving}
        saveStatus={saveStatus}
        isClearing={isClearing}
        clearStatus={clearStatus}
        onBack={onBack}
      />
      <button
        className={`absolute left-1/2 -translate-x-1/2 z-[1100] ${
          isNavbarVisible ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'
        } border rounded-full w-[15px] h-[15px] flex items-center justify-center cursor-pointer text-xs shadow-md transition-all duration-200 ease-in-out`}
        style={{ top: isNavbarVisible ? `${visibleNavbarHeight - 8}px` : '5px' }}
        onClick={toggleNavbar}
        title={isNavbarVisible ? "Collapse Navbar" : "Expand Navbar"}
      >
        {isNavbarVisible ? '▲' : '▼'}
      </button>
      <div
        className="flex-grow overflow-y-auto relative transition-height duration-350 ease-in-out"
        style={{ height: `calc(100% - ${isNavbarVisible ? visibleNavbarHeight : 0}px)` }}
      >
        {isLoadingGraph && (
          <div className="absolute inset-0 bg-white/80 flex justify-center items-center z-[1500] text-lg text-center">
            Loading graph data...
          </div>
        )}
        {graphLoadError && !isLoadingGraph && (
          <div className="absolute inset-0 bg-white/80 flex justify-center items-center z-[1500] text-lg text-center text-red-600">
            Error: {graphLoadError}
          </div>
        )}
        {!isLoadingGraph && !graphLoadError && (
          <KnowledgeGraph
            graphData={graphData}
            onNodeSelect={handleNodeSelect}
            selectedNode={selectedNode}
            onLinkSelect={handleLinkSelect}
            selectedLink={selectedLink}
            onNodeDoubleClick={handleEditNodeDoubleClick}
            onLinkDoubleClick={handleEditEdgeDoubleClick}
            selectingNodeFor={selectingNodeFor}
            onNodeSelectedForEdge={handleNodeSelectedForEdge}
            onBackgroundClick={handleBackgroundClick}
          />
        )}
        {clearStatus && (
          <div
            className={`absolute bottom-8 left-2.5 ${
              clearStatus.startsWith('Error') ? 'bg-red-100' : 'bg-green-100'
            } px-2.5 py-1 rounded z-[100]`}
          >
            {clearStatus}
          </div>
        )}
        {saveStatus && (
          <div
            className={`absolute bottom-2.5 left-2.5 ${
              saveStatus.startsWith('Error') ? 'bg-red-100' : 'bg-green-100'
            } px-2.5 py-1 rounded z-[100]`}
          >
            {saveStatus}
          </div>
        )}
        {importStatus && (
          <div
            className={`absolute left-2.5 ${
              importStatus.startsWith('Error') ? 'bg-red-100' : 'bg-yellow-100'
            } px-2.5 py-1 rounded z-[100]`}
            style={{
              bottom: saveStatus ? '60px' : (clearStatus ? '40px' : '10px')
            }}
          >
            {importStatus}
          </div>
        )}
      </div>
      {showNodeDialog && (
        <NodeDialog
          onClose={handleCloseDialog}
          onSave={handleSaveNode}
          nodeToEdit={nodeToEdit}
        />
      )}
      {showEdgeDialog && (
        <EdgeDialog
          onClose={handleCloseEdgeDialog}
          onSave={handleSaveEdge}
          onStartSelecting={handleStartSelectingNode}
          selectingFor={selectingNodeFor}
          sourceNodeId={edgeFormData.source}
          targetNodeId={edgeFormData.target}
          nodes={graphData.nodes}
          edgeToEdit={edgeToEdit}
        />
      )}
    </div>
  );
};

export default KgDisplay;