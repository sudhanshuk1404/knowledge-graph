// Import React and hooks for state and effect management
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// NodeDialog component for adding or editing a node in the graph
const NodeDialog = ({ onClose, onSave, nodeToEdit = null }) => {
  // Determine if we are editing an existing node or creating a new one
  const isEditing = !!nodeToEdit;
  
  // State for the node's ID, label (type), properties, and error messages
  const [nodeId, setNodeId] = useState('');
  const [label, setLabel] = useState('');
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState('');
  
  // Effect to initialize the form fields when editing or resetting for a new node
  useEffect(() => {
    if (nodeToEdit) {
      // Set the node ID and label from the node being edited
      setNodeId(nodeToEdit.id || '');
      setLabel(nodeToEdit.label || '');
      
      // Extract properties from the node object, EXCLUDING internal ones
      const filteredProps = Object.entries(nodeToEdit)
        .filter(([key]) => ![
          'id', 'label', 
          'x', 'y', 'vx', 'vy', // Positional/Velocity
          'index',              // Force engine index
          'fx', 'fy',           // Fixed position
          '__indexColor',       // Internal color property
        ].includes(key))
        .map(([key, value]) => ({ key, value: value || '' }));
      
      // Set properties only if they exist, otherwise it remains empty
      setProperties(filteredProps.length > 0 ? filteredProps : []);
    } else {
      // Reset form when adding a new node (not editing)
      setNodeId(`node_${Date.now()}`); // Default ID that user can change
      setLabel('');
      setProperties([]);
    }
    setError(''); // Clear any previous errors when opening/changing mode
  }, [nodeToEdit]);

  // Add a new empty property row to the properties array
  const handleAddProperty = () => {
    setProperties([...properties, { key: '', value: '' }]);
  };

  // Remove a property row by index
  const handleRemoveProperty = (index) => {
    const newProperties = [...properties];
    newProperties.splice(index, 1);
    setProperties(newProperties);
  };

  // Update a property key or value in the properties array
  const handlePropertyChange = (index, field, value) => {
    const newProperties = [...properties];
    newProperties[index][field] = value;
    setProperties(newProperties);
  };

  // Handle form submission for saving the node
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous error

    // Validate that the ID and label are not empty
    if (!nodeId.trim()) {
      setError('Node ID is required');
      return;
    }
    
    if (!label.trim()) {
      setError('Label is required');
      return;
    }
    
    // Validate property keys before creating the final object
    for (const prop of properties) {
        if (!prop.key.trim()) {
            setError('Property names cannot be empty. Please fill in or remove the empty property.');
            return; // Stop submission
        }
    }
    
    // Create an object with all property values
    const validProperties = properties.reduce((obj, prop) => {
        obj[prop.key.trim()] = prop.value;
        return obj;
    }, {});
      
    const nodeData = {
      // Use the custom ID from the form
      id: nodeId.trim(),
      label,
      ...validProperties
    };
    
    // If editing, preserve the fixed position if it exists
    if (isEditing && nodeToEdit.fx !== undefined) {
      nodeData.fx = nodeToEdit.fx;
      nodeData.fy = nodeToEdit.fy;
    }
    
    // Call the onSave handler with the node data and editing flag
    onSave(nodeData, isEditing);
  };

  // Dialog styles for overlay, dialog box, form, buttons, etc.
  const dialogStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 2000,
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      padding: '20px',
    },
    dialog: {
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '0',
      width: '400px',
      maxWidth: '90%',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '90vh',
      marginTop: '20px',
    },
    header: {
      padding: '15px 20px',
      borderBottom: '1px solid #eee',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    contentContainer: {
      padding: '20px',
      overflowY: 'auto', // Add vertical scrollbar when needed
      flex: '1 1 auto', // Allow this to grow/shrink
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
    },
    label: {
      fontWeight: 'bold',
      fontSize: '14px',
    },
    input: {
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      fontSize: '14px',
    },
    propertyRow: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
    },
    propertyInput: {
      flex: 1,
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      fontSize: '14px',
      minWidth: 0,
    },
    button: {
      padding: '8px 15px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
    },
    addButton: {
      backgroundColor: '#e2e3e5',
      color: '#41464b',
      marginTop: '5px',
      alignSelf: 'flex-start',
    },
    removeButton: {
      backgroundColor: '#f8d7da',
      color: '#842029',
      padding: '5px 10px',
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      padding: '15px 20px',
      borderTop: '1px solid #eee', // Add separator
      backgroundColor: '#fff', // Ensure it's not transparent
    },
    cancelButton: {
      backgroundColor: '#e2e3e5',
      color: '#41464b',
    },
    saveButton: {
      backgroundColor: '#d1e7dd',
      color: '#0f5132',
    },
    error: {
      color: '#842029',
      fontSize: '14px',
      marginTop: '10px',
    }
  };

  // Render the dialog UI for adding/editing a node
  return (
    <div style={dialogStyles.overlay}>
      <div style={dialogStyles.dialog}>
        <div style={dialogStyles.header}>
          <h2>{isEditing ? 'Edit Node' : 'Add New Node'}</h2>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
        
        <div style={dialogStyles.contentContainer}>
          <form onSubmit={handleSubmit} style={dialogStyles.form}>
            {/* Node ID field */}
            <div style={dialogStyles.formGroup}>
              <label style={dialogStyles.label}>ID:</label>
              <input
                type="text"
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                placeholder="Enter node ID"
                style={dialogStyles.input}
                required
                disabled={isEditing} // Disable editing ID for existing nodes
              />
              <small style={{color: '#666', fontSize: '0.8em'}}>
                {isEditing ? 'ID cannot be changed for existing nodes' : 'Example: patient_john_doe'}
              </small>
            </div>
            
            <div style={dialogStyles.formGroup}>
              <label style={dialogStyles.label}>Label:</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Enter node label (type)"
                style={dialogStyles.input}
                required
              />
            </div>
            
            <div style={dialogStyles.formGroup}>
              <label style={dialogStyles.label}>Properties:</label>
              {properties.length > 0 && properties.map((prop, index) => (
                <div key={index} style={dialogStyles.propertyRow}>
                  <input
                    type="text"
                    value={prop.key}
                    onChange={(e) => handlePropertyChange(index, 'key', e.target.value)}
                    placeholder="Property name"
                    style={dialogStyles.propertyInput}
                  />
                  <input
                    type="text"
                    value={prop.value}
                    onChange={(e) => handlePropertyChange(index, 'value', e.target.value)}
                    placeholder="Value"
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
              <button 
                type="button" 
                onClick={handleAddProperty}
                style={{...dialogStyles.button, ...dialogStyles.addButton}}
              >
                + Property
              </button>
            </div>
            
            {error && <div style={dialogStyles.error}>{error}</div>}
          </form>
        </div>
        
        <div style={dialogStyles.footer}>
          <button 
            type="button" 
            onClick={onClose}
            style={{...dialogStyles.button, ...dialogStyles.cancelButton}}
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            style={{...dialogStyles.button, ...dialogStyles.saveButton}}
          >
            {isEditing ? 'Update Node' : 'Save Node'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Export the NodeDialog component as default
export default NodeDialog; 