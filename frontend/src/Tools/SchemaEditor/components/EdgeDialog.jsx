// Import React and hooks for state and effect management
import React, { useState, useEffect } from 'react';

// EdgeDialog component for adding/editing an edge (relationship) between nodes
const EdgeDialog = ({
  onClose,            // Function to close the dialog
  onSave,             // Function to save the edge data
  onStartSelecting,   // Function to call when user wants to select a node from graph
  selectingFor,       // Indicates if we are selecting 'source' or 'target'
  sourceNodeId,       // Currently selected source node ID (passed from App)
  targetNodeId,       // Currently selected target node ID (passed from App)
  nodes,              // All nodes, to display labels
  edgeToEdit = null,  // Edge object if editing, null if adding
}) => {
  // Determine if we are editing an existing edge
  const isEditing = !!edgeToEdit;
  // State for edge label and properties
  const [label, setLabel] = useState('');
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState('');

  // Helper to get a display label for a node by its ID
  const getDisplayLabel = (nodeId) => {
    if (!nodeId) return '(None selected)';
    const node = nodes.find(n => n.id === nodeId);
    return node ? `${node.label || 'Unknown'} (${node.id})` : `(${nodeId} - Not Found)`;
  };

  // Display strings for source and target nodes
  const sourceDisplay = getDisplayLabel(sourceNodeId);
  const targetDisplay = getDisplayLabel(targetNodeId);

  // Effect to populate dialog fields when editing or resetting for new edge
  useEffect(() => {
    if (isEditing) {
      // Populate fields from edgeToEdit when editing
      setLabel(edgeToEdit.label || '');
      const edgeProps = Object.entries(edgeToEdit)
        .filter(([key]) => ![
          'id', 'label',        // Core edge data
          'source', 'target',  // Core edge data
          '__indexColor',      // Library internal
          'index',             // Library internal
          '__controlPoints'    // Library internal
        ].includes(key))
        .map(([key]) => ({ key }));
      setProperties(edgeProps);
    } else {
      // Reset fields for adding a new edge
      setLabel('');
      setProperties([]);
    }
    setError(''); // Clear error on mode change or open
  }, [edgeToEdit, isEditing]); // Depend on edgeToEdit

  // Add a new empty property row
  const handleAddProperty = () => {
    setProperties([...properties, { key: '' }]);
  };

  // Remove a property row by index
  const handleRemoveProperty = (index) => {
    const newProperties = [...properties];
    newProperties.splice(index, 1);
    setProperties(newProperties);
  };

  // Update a property key
  const handlePropertyChange = (index, value) => {
    const newProperties = [...properties];
    newProperties[index].key = value;
    setProperties(newProperties);
  };

  // Handle form submission for saving the edge
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!sourceNodeId) {
      setError('Please select a source node.');
      return;
    }
    if (!targetNodeId) {
      setError('Please select a target node.');
      return;
    }
    if (!label.trim()) {
      setError('Edge label is required.');
      return;
    }
    if (!isEditing && sourceNodeId === targetNodeId) {
        setError('Source and target nodes cannot be the same.');
        return;
    }

    // Validate property keys
    for (const prop of properties) {
      if (!prop.key.trim()) {
        setError('Property names cannot be empty. Please fill in or remove the empty property.');
        return;
      }
    }

    // Create an object with empty string values for each property
    const validProperties = properties.reduce((obj, prop) => {
      obj[prop.key.trim()] = "";
      return obj;
    }, {});

    // Construct the edge data object to save
    const edgeData = {
      // Use existing ID if editing, otherwise generate a new one
      id: isEditing ? edgeToEdit.id : `edge_${Date.now()}`,
      // Source/Target are handled by App state, but pass them along
      source: sourceNodeId,
      target: targetNodeId,
      label,
      ...validProperties,
    };
    // Pass isEditing flag to the save handler
    onSave(edgeData, isEditing);
  };

  // --- Compact Styles ---
  // Inline style objects for dialog and form elements
  const dialogStyles = {
    overlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)', zIndex: 1900,
      pointerEvents: selectingFor ? 'none' : 'auto',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      padding: '20px',
    },
    dialog: {
      position: 'relative',
      backgroundColor: '#fff', 
      borderRadius: '6px',
      width: '320px',
      maxWidth: '35%',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
      zIndex: 1901,
      marginTop: '20px',
    },
    header: {
      padding: '10px 15px',
      borderBottom: '1px solid #eee', 
      display: 'flex',
      justifyContent: 'space-between', 
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: '1.1em',
      fontWeight: '600',
      margin: 0,
    },
    contentContainer: {
      padding: '15px',
      overflowY: 'auto', // Add vertical scrolling
      flex: '1 1 auto', // Allow content to grow/shrink
    },
    closeButton: {
       background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '0 5px'
    },
    form: { display: 'flex', flexDirection: 'column', gap: '10px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { fontWeight: 'bold', fontSize: '13px' },
    input: { padding: '6px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' },
    // Specific styles for edge dialog
    nodeSelectionGroup: {
      display: 'flex', alignItems: 'center', gap: '8px',
      marginBottom: '8px',
      padding: '6px',
      border: '1px solid #eee', borderRadius: '4px',
    },
    nodeDisplay: {
      flexGrow: 1, fontStyle: 'italic', color: '#555', fontSize: '12px',
      overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
    },
    selectButton: (isActive) => ({
      padding: '4px 8px', fontSize: '11px',
      cursor: 'pointer', border: `1px solid ${isActive ? '#007bff' : '#ccc'}`,
      backgroundColor: isActive ? '#e7f3ff' : '#f8f9fa', color: isActive ? '#0056b3' : '#333',
      borderRadius: '4px', whiteSpace: 'nowrap',
    }),
    propertyRow: { display: 'flex', gap: '8px', alignItems: 'center' },
    propertyInput: { flex: 1, padding: '6px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', minWidth: 0 },
    button: { padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '13px' },
    addButton: { backgroundColor: '#e2e3e5', color: '#41464b', marginTop: '4px', alignSelf: 'flex-start', padding: '5px 10px', fontSize: '12px' },
    removeButton: { backgroundColor: '#f8d7da', color: '#842029', padding: '3px 8px', fontSize: '12px' },
    footer: { 
      display: 'flex', 
      justifyContent: 'flex-end', 
      gap: '8px', 
      padding: '10px 15px',
      borderTop: '1px solid #eee',
      backgroundColor: '#fff'
    },
    cancelButton: { backgroundColor: '#e2e3e5', color: '#41464b' },
    saveButton: { backgroundColor: '#d1e7dd', color: '#0f5132' },
    error: { color: '#842029', fontSize: '12px', marginTop: '8px' }
  };

  // Render the edge dialog UI
  return (
    <div style={dialogStyles.overlay} onClick={selectingFor ? null : onClose}>
      <div style={dialogStyles.dialog} onClick={(e) => e.stopPropagation()}>
        <div style={dialogStyles.header}>
          <h2 style={dialogStyles.headerTitle}>{isEditing ? 'Edit Edge' : 'Add New Edge'}</h2>
          <button onClick={onClose} style={dialogStyles.closeButton}>×</button>
        </div>

        <div style={dialogStyles.contentContainer}>
          <form onSubmit={handleSubmit} style={dialogStyles.form}>
            <div style={dialogStyles.formGroup}>
              <label style={dialogStyles.label}>Source Node:</label>
              <div style={dialogStyles.nodeSelectionGroup}>
                <span style={dialogStyles.nodeDisplay}>{sourceDisplay}</span>
                <button
                  type="button"
                  style={dialogStyles.selectButton(selectingFor === 'source')}
                  onClick={() => onStartSelecting('source')}
                  disabled={isEditing}
                >
                  {selectingFor === 'source' ? 'Selecting...' : 'Select'}
                </button>
              </div>
            </div>

            <div style={dialogStyles.formGroup}>
              <label style={dialogStyles.label}>Target Node:</label>
              <div style={dialogStyles.nodeSelectionGroup}>
                <span style={dialogStyles.nodeDisplay}>{targetDisplay}</span>
                <button
                  type="button"
                  style={dialogStyles.selectButton(selectingFor === 'target')}
                  onClick={() => onStartSelecting('target')}
                  disabled={isEditing}
                >
                  {selectingFor === 'target' ? 'Selecting...' : 'Select'}
                </button>
              </div>
            </div>

            <div style={dialogStyles.formGroup}>
              <label style={dialogStyles.label}>Label:</label>
              <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Enter edge label" style={dialogStyles.input} required />
            </div>

            <div style={dialogStyles.formGroup}>
              <label style={dialogStyles.label}>Properties:</label>
               {properties.length > 0 && properties.map((prop, index) => (
                  <div key={index} style={dialogStyles.propertyRow}>
                     <input 
                       type="text" 
                       value={prop.key} 
                       onChange={(e) => handlePropertyChange(index, e.target.value)} 
                       placeholder="Property name" 
                       style={dialogStyles.propertyInput}
                     />
                     <button 
                       type="button" 
                       onClick={() => handleRemoveProperty(index)} 
                       style={{...dialogStyles.button, ...dialogStyles.removeButton}}
                     >
                       -
                     </button>
                  </div>
               ))}
              <button type="button" onClick={handleAddProperty} style={{...dialogStyles.button, ...dialogStyles.addButton}}>+ Property</button>
            </div>

            {error && <div style={dialogStyles.error}>{error}</div>}
          </form>
        </div>
        
        <div style={dialogStyles.footer}>
          <button type="button" onClick={onClose} style={{...dialogStyles.button, ...dialogStyles.cancelButton}}>Cancel</button>
          <button type="button" onClick={handleSubmit} style={{...dialogStyles.button, ...dialogStyles.saveButton}}>{isEditing ? 'Update Edge' : 'Save Edge'}</button>
        </div>
      </div>
    </div>
  );
};

// Export the EdgeDialog component as default
export default EdgeDialog; 