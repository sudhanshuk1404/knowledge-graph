// Import React and required hooks, as well as custom components and utility functions
import React, { useState, useRef, useEffect } from "react";
import KnowledgeGraph from "./components/KnowledgeGraph";
import Navbar from "./components/Navbar";
import NodeDialog from "./components/NodeDialog";
import EdgeDialog from "./components/EdgeDialog";
import { generateLpgSchema, downloadJson } from "./utils/KGExportParser";
import { handleJsonFileUpload } from "./utils/KGImportParser";

// Main App component
const KnowledgeGraphTool = () => {
  // State for showing/hiding the navbar and tracking its height
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [visibleNavbarHeight, setVisibleNavbarHeight] = useState(0);
  const navbarRef = useRef(null);

  // State for graph data and selection
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const [nodeToEdit, setNodeToEdit] = useState(null);

  // State for edge creation/editing
  const [showEdgeDialog, setShowEdgeDialog] = useState(false);
  const [edgeFormData, setEdgeFormData] = useState({
    source: null,
    target: null,
  });
  const [selectingNodeFor, setSelectingNodeFor] = useState(null); // 'source', 'target', or null
  const [edgeToEdit, setEdgeToEdit] = useState(null); // State for edge being edited

  // State for saving to DB
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  // State for loading the graph from backend
  const [isLoadingGraph, setIsLoadingGraph] = useState(true); // Start as true
  const [graphLoadError, setGraphLoadError] = useState(null);

  // State for clearing the graph
  const [isClearing, setIsClearing] = useState(false);
  const [clearStatus, setClearStatus] = useState("");

  // State for import status
  const [importStatus, setImportStatus] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Effect to measure and store the navbar's height when it's visible
  useEffect(() => {
    // Function to measure and update the stable height
    const measureAndUpdateHeight = () => {
      if (navbarRef.current) {
        const currentHeight = navbarRef.current.offsetHeight;
        // Update the stored height only if it's actually visible and has a positive height
        if (currentHeight > 0 && currentHeight !== visibleNavbarHeight) {
          setVisibleNavbarHeight(currentHeight);
        }
      }
    };

    if (isNavbarVisible) {
      // If becoming visible, measure immediately and potentially again after transition
      measureAndUpdateHeight();
      // Optional: A timeout can help ensure measurement happens after CSS transition settles
      const timeoutId = setTimeout(measureAndUpdateHeight, 370); // Slightly > transition time
      return () => clearTimeout(timeoutId); // Cleanup timeout
    }
    // No need to set visibleNavbarHeight to 0 when hidden, it only matters when isNavbarVisible is true
  }, [isNavbarVisible]); // Rerun only when visibility changes

  // Toggle the visibility of the navbar
  const toggleNavbar = () => {
    setIsNavbarVisible(!isNavbarVisible);
  };

  // Node operations: open dialog to add node
  const handleAddNodeClick = () => {
    setNodeToEdit(null); // Ensure we're in "add" mode
    setShowNodeDialog(true);
  };

  // Node operations: open dialog to edit node
  const handleEditNodeDoubleClick = (node) => {
    setNodeToEdit(node); // Set the node to edit
    setShowNodeDialog(true);
  };

  // Close the node dialog
  const handleCloseDialog = () => {
    setShowNodeDialog(false);
    setNodeToEdit(null);
  };

  // Save node (add or edit)
  const handleSaveNode = (updatedNode, isEditing) => {
    if (isEditing) {
      // Update existing node
      setGraphData((prevData) => {
        // Update node in nodes array
        const updatedNodes = prevData.nodes.map((node) =>
          node.id === updatedNode.id ? updatedNode : node
        );

        // We also need to update references to this node in the links array
        const updatedLinks = prevData.links.map((link) => {
          // Create a new link object to avoid modifying the original
          const newLink = { ...link };

          // Check if source is an object reference to the updated node
          if (
            typeof link.source === "object" &&
            link.source.id === updatedNode.id
          ) {
            newLink.source = updatedNode;
          }

          // Check if target is an object reference to the updated node
          if (
            typeof link.target === "object" &&
            link.target.id === updatedNode.id
          ) {
            newLink.target = updatedNode;
          }

          return newLink;
        });

        return {
          nodes: updatedNodes,
          links: updatedLinks,
        };
      });
    } else {
      // Add new node - no links to update
      setGraphData((prevData) => ({
        ...prevData,
        nodes: [...prevData.nodes, updatedNode],
      }));
    }
    setShowNodeDialog(false);
    setNodeToEdit(null);
  };

  // Select a node in the graph
  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    setSelectedLink(null);
  };

  // Select a link in the graph
  const handleLinkSelect = (link) => {
    setSelectedLink(link);
    setSelectedNode(null);
  };

  // Deselect node/link and cancel edge selection if needed
  const handleBackgroundClick = () => {
    setSelectedNode(null);
    setSelectedLink(null);
    if (selectingNodeFor) {
      setSelectingNodeFor(null);
    }
  };

  // Delete selected node and its connected links
  const handleDeleteNode = () => {
    if (!selectedNode) return;
    setGraphData((prevData) => ({
      nodes: prevData.nodes.filter((node) => node.id !== selectedNode.id),
      links: prevData.links.filter(
        (link) =>
          (typeof link.source === "object" ? link.source.id : link.source) !==
            selectedNode.id &&
          (typeof link.target === "object" ? link.target.id : link.target) !==
            selectedNode.id
      ),
    }));
    setSelectedNode(null);
  };

  // Delete selected link
  const handleDeleteLink = () => {
    if (!selectedLink) return;
    setGraphData((prevData) => ({
      ...prevData,
      links: prevData.links.filter((link) => link.id !== selectedLink.id),
    }));
    setSelectedLink(null);
  };

  // Keyboard shortcuts for delete and escape actions
  const handleKeyDown = (e) => {
    if (e.key === "Delete") {
      if (selectedNode) {
        handleDeleteNode();
      } else if (selectedLink) {
        handleDeleteLink();
      }
    }
    if (e.key === "Escape") {
      if (showNodeDialog) handleCloseDialog();
      if (showEdgeDialog) handleCloseEdgeDialog();
      if (selectingNodeFor) setSelectingNodeFor(null);
      if (selectedNode) setSelectedNode(null);
      if (selectedLink) setSelectedLink(null);
    }
  };

  // Attach/detach keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedNode, selectedLink]);

  // Edge creation: open dialog to add edge
  const handleAddEdgeClick = () => {
    setEdgeToEdit(null); // Ensure not in edit mode
    setEdgeFormData({ source: null, target: null });
    setSelectingNodeFor(null);
    setShowEdgeDialog(true);
    setSelectedNode(null);
  };

  // Edge editing: open dialog to edit edge
  const handleEditEdgeDoubleClick = (edge) => {
    const sourceId =
      typeof edge.source === "object" ? edge.source.id : edge.source;
    const targetId =
      typeof edge.target === "object" ? edge.target.id : edge.target;
    setEdgeToEdit(edge);
    setEdgeFormData({ source: sourceId, target: targetId });
    setSelectingNodeFor(null);
    setShowEdgeDialog(true);
    setSelectedNode(null);
    setSelectedLink(null);
  };

  // Close the edge dialog
  const handleCloseEdgeDialog = () => {
    setShowEdgeDialog(false);
    setSelectingNodeFor(null);
    setEdgeFormData({ source: null, target: null });
    setEdgeToEdit(null); // Reset edge being edited
  };

  // Start selecting a node for edge creation (source or target)
  const handleStartSelectingNode = (type) => {
    // Prevent interactive selection if editing an existing edge
    if (!edgeToEdit) {
      setSelectingNodeFor(type);
    }
  };

  // Handle node selection for edge creation
  const handleNodeSelectedForEdge = (selectedGraphNode) => {
    if (!selectingNodeFor || !selectedGraphNode || edgeToEdit) return; // Don't allow changing source/target when editing

    setEdgeFormData((prevData) => ({
      ...prevData,
      [selectingNodeFor]: selectedGraphNode.id,
    }));
    setSelectingNodeFor(null);
  };

  // Save edge (add or edit)
  const handleSaveEdge = (edgeDataFromDialog, isEditing) => {
    if (isEditing) {
      // Update existing edge
      setGraphData((prevData) => ({
        ...prevData,
        links: prevData.links.map((link) =>
          link.id === edgeDataFromDialog.id ? edgeDataFromDialog : link
        ),
      }));
    } else {
      // Add new edge (ensure source/target are set from edgeFormData if needed)
      const newEdge = {
        ...edgeDataFromDialog,
        source: edgeFormData.source || edgeDataFromDialog.source, // Prioritize selection
        target: edgeFormData.target || edgeDataFromDialog.target,
      };
      setGraphData((prevData) => ({
        ...prevData,
        links: [...prevData.links, newEdge],
      }));
    }
    handleCloseEdgeDialog(); // Close dialog and reset state
  };

  // Export the current graph as a JSON schema file
  const handleExportJson = () => {
    console.log("Exporting graph schema...");
    try {
      const schema = generateLpgSchema(graphData);
      downloadJson(schema, "graph-lpg-schema.json");
    } catch (error) {
      console.error("Error generating or downloading schema:", error);
      // Optionally show an error message to the user
    }
  };

  // Save the current graph to the backend database
  const handleSaveToDb = async () => {
    if (isSaving) return;
    console.log("Saving graph to DB...");
    setIsSaving(true);
    setSaveStatus("Saving...");

    // Create clean copy for saving (same as before)
    const dataToSave = {
      nodes: graphData.nodes.map((n) => ({ ...n })),
      links: graphData.links.map((l) => ({
        ...l,
        source: typeof l.source === "object" ? l.source.id : l.source,
        target: typeof l.target === "object" ? l.target.id : l.target,
      })),
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/graph/save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSave),
        }
      );

      if (response.status === 503) {
        // Database connection is unavailable
        setSaveStatus("Database unavailable - working in local mode");
        setTimeout(() => setSaveStatus(""), 5000);
      } else {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(
            result.error || `HTTP error! status: ${response.status}`
          );
        }
        console.log("Save successful:", result.message);
        setSaveStatus("Saved successfully!");
        setTimeout(() => setSaveStatus(""), 3000);
      }
    } catch (error) {
      console.error("❌ Error saving graph:", error);
      setSaveStatus(`Error: ${error.message}`);
      setTimeout(() => setSaveStatus(""), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Clear the entire graph from the backend and frontend
  const handleClearGraph = async () => {
    if (isClearing || isSaving) return; // Prevent action if already clearing or saving

    // Confirmation dialog
    if (
      !window.confirm(
        "Are you sure you want to clear the graph? This action cannot be undone."
      )
    ) {
      return; // User cancelled
    }

    console.log("Clearing graph...");
    setIsClearing(true);
    setClearStatus("Clearing...");
    setSaveStatus(""); // Clear save status if any

    try {
      // First attempt to clear from the database
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/graph/clear`,
        {
          method: "DELETE",
        }
      );

      // Handle different scenarios
      if (response.status === 503) {
        // Database is unavailable, but we can still clear the UI
        console.log("Database unavailable, clearing UI only");
        setClearStatus("Database unavailable - cleared UI only");
      } else {
        // If database is available, process the response normally
        const result = await response.json();
        if (!response.ok) {
          throw new Error(
            result.error || `HTTP error! status: ${response.status}`
          );
        }
        console.log("Clear successful:", result.message);
        setClearStatus("Graph cleared successfully!");
      }

      // Clear the frontend state in all cases
      setGraphData({ nodes: [], links: [] });
      setSelectedNode(null);
      setSelectedLink(null);

      // Clear status after a few seconds
      setTimeout(() => setClearStatus(""), 3000);
    } catch (error) {
      console.error("❌ Error clearing graph:", error);

      // Even if there's an error, still clear the UI
      setGraphData({ nodes: [], links: [] });
      setSelectedNode(null);
      setSelectedLink(null);

      setClearStatus(`UI cleared. Server error: ${error.message}`);
      setTimeout(() => setClearStatus(""), 5000);
    } finally {
      setIsClearing(false);
    }
  };

  // Effect to load the graph data from the backend on initial mount
  useEffect(() => {
    const loadGraphData = async () => {
      setIsLoadingGraph(true);
      setGraphLoadError(null);
      console.log("Attempting to load graph data from backend...");
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/graph`
        );
        const data = await response.json();

        if (response.status === 503) {
          // Neptune is unavailable but we can still work locally
          console.warn(
            "Database connection unavailable - working in local mode"
          );
          setGraphData({ nodes: [], links: [] }); // Start with empty graph
          setGraphLoadError(
            "Database connection unavailable - working in local mode only"
          );
          setTimeout(() => setGraphLoadError(null), 5000); // Clear error after 5 seconds
        } else if (!response.ok) {
          throw new Error(
            data.error || `HTTP error! Status: ${response.status}`
          );
        } else {
          console.log("Graph data loaded successfully:", data);
          setGraphData({ nodes: data.nodes || [], links: data.links || [] });
        }
      } catch (error) {
        console.error("❌ Failed to load graph data:", error);
        setGraphLoadError(
          "Working in local mode - changes won't be saved to database"
        );
        setTimeout(() => setGraphLoadError(null), 5000);
        setGraphData({ nodes: [], links: [] }); // Reset data on error but allow tool use
      } finally {
        setIsLoadingGraph(false);
      }
    };

    loadGraphData();
  }, []);

  // Import a graph from a JSON file
  const handleImportJson = async (file) => {
    if (isImporting) return; // Prevent multiple imports at once

    console.log("Importing JSON schema...");
    setIsImporting(true);
    setImportStatus("Importing...");

    try {
      const importedGraphData = await handleJsonFileUpload(file);
      console.log("Successfully parsed JSON schema:", importedGraphData);

      // Ask for confirmation if the current graph is not empty
      if (graphData.nodes.length > 0 || graphData.links.length > 0) {
        const confirmImport = window.confirm(
          "This will replace your current graph with the imported data. Continue?"
        );

        if (!confirmImport) {
          setImportStatus("Import cancelled");
          setTimeout(() => setImportStatus(""), 3000);
          setIsImporting(false);
          return;
        }
      }

      // Update the graph with the imported data
      setGraphData(importedGraphData);
      setImportStatus("JSON imported successfully!");

      // Clear any selections
      setSelectedNode(null);
      setSelectedLink(null);

      // Clear status after a few seconds
      setTimeout(() => setImportStatus(""), 3000);
    } catch (error) {
      console.error("❌ Error importing JSON:", error);
      setImportStatus(`Error: ${error.message}`);
      // Keep error message displayed longer
      setTimeout(() => setImportStatus(""), 5000);
    } finally {
      setIsImporting(false);
    }
  };

  // Styles for the main App container
  const appStyle = {
    display: "flex",
    flexDirection: "column",
    height: "100vh", // Full viewport height
    overflow: "hidden", // Prevent overall page scroll
  };

  // Calculate the effective offset based on visibility and the stored visible height
  const currentNavbarOffset = isNavbarVisible ? visibleNavbarHeight : 0;

  // Styles for the content area holding the graph
  const contentStyle = {
    flexGrow: 1, // Take remaining vertical space
    overflowY: "auto", // Allow scrolling inside graph area if needed
    position: "relative", // For potential internal positioning
    transition: "height 0.35s ease-in-out", // Animate height change
    // Use the calculated offset based on visibility
    height: `calc(100% - ${currentNavbarOffset}px)`,
  };

  // Styles for the toggle button
  const toggleButtonStyle = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1100,
    background: isNavbarVisible ? "#f8d7da" : "#d1e7dd", // Red when visible (collapse), Green when hidden (expand)
    color: isNavbarVisible ? "#842029" : "#0f5132",
    border: `1px solid ${isNavbarVisible ? "#f5c2c7" : "#badbcc"}`,
    borderRadius: "50%",
    width: "15px",
    height: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "12px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    transition:
      "top 0.35s ease-in-out, background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease",
    // Calculate 'top' based on visibility and the stored visible height
    top: isNavbarVisible ? `${visibleNavbarHeight - 8}px` : "5px",
  };

  // Style for loading/error overlay
  const loadingOverlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1500, // Above graph, below dialogs
    fontSize: "1.2em",
    textAlign: "center",
  };

  // Render the main app UI
  return (
    <div style={appStyle}>
      {/* Pass ref and isVisible to Navbar, along with new import handler */}
      <Navbar
        ref={navbarRef}
        isVisible={isNavbarVisible}
        onAddNode={handleAddNodeClick}
        onAddEdge={handleAddEdgeClick}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onSaveToDb={handleSaveToDb}
        isSaving={isSaving}
        saveStatus={saveStatus}
        onClearGraph={handleClearGraph}
        isClearing={isClearing}
        clearStatus={clearStatus}
      />

      {/* Render the toggle button */}
      <button
        style={toggleButtonStyle}
        onClick={toggleNavbar}
        title={isNavbarVisible ? "Collapse Navbar" : "Expand Navbar"}
      >
        {/* Red Up arrow (collapse) when visible, Green Down arrow (expand) when hidden */}
        {isNavbarVisible ? "▲" : "▼"}
      </button>

      {/* Render the graph area */}
      <div style={contentStyle}>
        {/* Conditionally render Loading/Error Overlay */}
        {isLoadingGraph && (
          <div style={loadingOverlayStyle}>Loading graph data...</div>
        )}
        {graphLoadError && !isLoadingGraph && (
          <div style={{ ...loadingOverlayStyle, color: "red" }}>
            Error: {graphLoadError}
          </div>
        )}
        {/* Render graph only when not loading and no error */}
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
        {/* Optional: Display Clear Status (similar to Save Status) */}
        {clearStatus && (
          <div
            style={{
              position: "absolute",
              bottom: "30px",
              left: "10px",
              backgroundColor: clearStatus.startsWith("Error")
                ? "#f8d7da"
                : "#d1e7dd",
              padding: "5px 10px",
              borderRadius: "4px",
              zIndex: 100,
            }}
          >
            {clearStatus}
          </div>
        )}
        {/* Adjust positioning if both save/clear statuses can appear */}
        {saveStatus && (
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              backgroundColor: saveStatus.startsWith("Error")
                ? "#f8d7da"
                : "#d1e7dd",
              padding: "5px 10px",
              borderRadius: "4px",
              zIndex: 100,
            }}
          >
            {saveStatus}
          </div>
        )}
        {/* Add import status message alongside other status messages */}
        {importStatus && (
          <div
            style={{
              position: "absolute",
              bottom: saveStatus ? "60px" : clearStatus ? "40px" : "10px", // Adjust position based on other statuses
              left: "10px",
              backgroundColor: importStatus.startsWith("Error")
                ? "#f8d7da"
                : "#fff3cd",
              padding: "5px 10px",
              borderRadius: "4px",
              zIndex: 100,
            }}
          >
            {importStatus}
          </div>
        )}
      </div>

      {/* Node creation/editing dialog */}
      {showNodeDialog && (
        <NodeDialog
          onClose={handleCloseDialog}
          onSave={handleSaveNode}
          nodeToEdit={nodeToEdit}
        />
      )}

      {/* Edge Dialog */}
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

// Export the App component as default
export default KnowledgeGraphTool;
