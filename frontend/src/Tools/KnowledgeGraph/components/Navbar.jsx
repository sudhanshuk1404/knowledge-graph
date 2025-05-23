// Import React and hooks for state and ref management
import React, { useState, forwardRef, useRef } from 'react';

// Define colors for different actions (used for button backgrounds, borders, and text)
const colors = {
  save: { bg: '#d1e7dd', border: '#badbcc', text: '#0f5132', hoverBg: '#b6d7c4', hoverBorder: '#a9c8b8' }, // Greenish
  export: { bg: '#cff4fc', border: '#b6effb', text: '#055160', hoverBg: '#b3e8f7', hoverBorder: '#a3d9e8' }, // Blueish
  import: { bg: '#fff3cd', border: '#ffecb5', text: '#664d03', hoverBg: '#ffe69c', hoverBorder: '#ffd769' }, // Yellowish
  clear: { bg: '#f8d7da', border: '#f5c2c7', text: '#842029', hoverBg: '#f1c1c6', hoverBorder: '#e6aeb4' }, // Reddish
  add: { bg: '#e2e3e5', border: '#d3d6d8', text: '#41464b', hoverBg: '#d1d3d5', hoverBorder: '#c1c4c6' }, // Grayish/Neutral
  default: { bg: '#f8f9fa', border: '#ced4da', text: '#495057', hoverBg: '#e9ecef', hoverBorder: '#adb5bd' }, // Default
};

// Helper function to select color scheme based on button text
const getButtonColors = (actionText) => {
  const lowerCaseText = actionText.toLowerCase();
  if (lowerCaseText.includes('save')) return colors.save;
  if (lowerCaseText.includes('export')) return colors.export;
  if (lowerCaseText.includes('import')) return colors.import;
  if (lowerCaseText.includes('clear')) return colors.clear;
  if (lowerCaseText.includes('add')) return colors.add;
  return colors.default;
};

// Navbar component definition, wrapped in forwardRef to allow parent to access the DOM node
const Navbar = forwardRef(({
    isVisible,           // Controls whether the navbar is shown or collapsed
    onAddNode,           // Handler for "Add Node" button
    onAddEdge,           // Handler for "Add Edge" button
    onExportJson,        // Handler for "Export as JSON" button
    onImportJson,        // Handler for "Import JSON" button (file import)
    onSaveToDb, isSaving, saveStatus, // Handlers and state for "Save to DB"
    onClearGraph, isClearing, clearStatus // Handlers and state for "Clear Graph"
  }, ref) => {
  // State to manage which button is currently hovered (for hover effect)
  const [hoveredButton, setHoveredButton] = useState(null);
  
  // Ref for the hidden file input (used for importing JSON)
  const fileInputRef = useRef(null);

  // Styles for the navbar container, including transition for collapse/expand
  const baseNavbarStyle = {
    paddingLeft: '25px',
    paddingRight: '25px',
    backgroundColor: '#ffffff',
    borderBottomStyle: 'solid', // Keep style consistent
    borderBottomColor: '#e0e0e0',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap', // Allow wrapping
    gap: '15px', // Gap between wrapped sections
    overflow: 'hidden', // Crucial for hiding content during collapse
    transition: 'max-height 0.35s ease-in-out, padding-top 0.35s ease-in-out, padding-bottom 0.35s ease-in-out, border-bottom-width 0.35s ease-in-out',
    // Important: Set initial state for transition
    maxHeight: isVisible ? '500px' : '0', // Start with correct maxHeight
    paddingTop: isVisible ? '12px' : '0',
    paddingBottom: isVisible ? '12px' : '0',
    borderBottomWidth: isVisible ? '1px' : '0',
  };

  // Style for each section (left, middle, right) of the navbar
  const sectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px', // Consistent gap within sections
  };

  // Style for the title text
  const titleStyle = {
    fontSize: '1.6em', // Slightly larger title
    fontWeight: '600', // Bolder
    color: '#333', // Darker text color
    marginRight: '30px', // More space after title
  };

  // Base style for all buttons, with dynamic color applied later
  const baseButtonStyle = {
    padding: '8px 16px',
    cursor: 'pointer',
    borderRadius: '5px',
    fontSize: '0.95em',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease', // Added color transition
    whiteSpace: 'nowrap',
    borderWidth: '1px', // Ensure border width is set
    borderStyle: 'solid', // Ensure border style is set
  };

  // Helper to get the final button style, including hover and disabled states
  const getButtonStyle = (text, disabled = false) => {
    const buttonColors = getButtonColors(text);
    const isHovered = !disabled && hoveredButton === text;
    let finalStyle = {
      ...baseButtonStyle,
      backgroundColor: isHovered ? buttonColors.hoverBg : buttonColors.bg,
      borderColor: isHovered ? buttonColors.hoverBorder : buttonColors.border,
      color: buttonColors.text,
    };
    if (disabled) {
      finalStyle = {
        ...finalStyle,
        cursor: 'not-allowed',
        opacity: 0.6,
        backgroundColor: buttonColors.bg,
        borderColor: buttonColors.border,
      };
    }
    return finalStyle;
  };

  // Handler for button clicks, dispatches to the correct callback
  const handleButtonClick = (action) => {
    console.log(`${action} button clicked`);
    if (action === 'Add Node' && onAddNode) { onAddNode(); }
    else if (action === 'Add Edge' && onAddEdge) { onAddEdge(); }
    else if (action === 'Export as JSON' && onExportJson) { onExportJson(); }
    else if (action === 'Import JSON' && fileInputRef.current) { fileInputRef.current.click(); }
    else if (action === 'Save to DB' && onSaveToDb) { onSaveToDb(); }
    else if (action === 'Clear Graph' && onClearGraph) { onClearGraph(); }
  };
  
  // Handler for file input change (when a file is selected for import)
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && onImportJson) {
      onImportJson(file);
    }
    // Reset the file input so the same file can be selected again if needed
    event.target.value = '';
  };

  // Render the navbar with all buttons and sections
  // The nav element receives the forwarded ref for height measurement
  return (
    <nav style={baseNavbarStyle} ref={ref}>
      {/* Hidden file input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        style={{ display: 'none' }}
      />
      
      {/* Left Section: Title + Actions */}
      <div style={sectionStyle}>
        <span style={titleStyle}>Knowledge Graph</span>
        {['Save to DB', 'Export as JSON', 'Import JSON', 'Clear Graph'].map((text) => {
           // Disable Save if saving, disable Clear if clearing or saving
           const isDisabled = (text === 'Save to DB' && isSaving) ||
                              (text === 'Clear Graph' && (isClearing || isSaving));
           let buttonText = text;
           if (text === 'Save to DB' && isSaving) {
             buttonText = saveStatus || 'Saving...';
           } else if (text === 'Clear Graph' && isClearing) {
             buttonText = clearStatus || 'Clearing...';
           }

           return (
              <button
                key={text}
                style={getButtonStyle(text, isDisabled)}
                onClick={() => handleButtonClick(text)}
                onMouseEnter={() => setHoveredButton(text)}
                onMouseLeave={() => setHoveredButton(null)}
                disabled={isDisabled}
              >
                 {buttonText}
              </button>
           );
        })}
      </div>

      {/* Middle Section: Add Actions */}
      <div style={sectionStyle}>
        {['Add Node', 'Add Edge'].map((text) => (
          <button
            key={text}
            style={getButtonStyle(text)} // Use helper function for styles
            onClick={() => handleButtonClick(text)}
            onMouseEnter={() => setHoveredButton(text)}
            onMouseLeave={() => setHoveredButton(null)}
          >
            {text}
          </button>
        ))}
      </div>

      {/* Right Section: Empty, but keeps layout consistent */}
      <div style={{ minWidth: '1px' }}></div>
    </nav>
  );
}); // Close forwardRef

// Export the Navbar component as default
export default Navbar; 