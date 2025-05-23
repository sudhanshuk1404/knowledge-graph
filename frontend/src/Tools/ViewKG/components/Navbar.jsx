import React, { useState, useRef, forwardRef } from 'react';

const colors = {
  save: { bg: '#d1e7dd', border: '#badbcc', text: '#0f5132', hoverBg: '#b6d7c4', hoverBorder: '#a9c8b8' },
  export: { bg: '#cff4fc', border: '#b6effb', text: '#055160', hoverBg: '#b3e8f7', hoverBorder: '#a3d9e8' },
  import: { bg: '#fff3cd', border: '#ffecb5', text: '#664d03', hoverBg: '#ffe69c', hoverBorder: '#ffd769' },
  clear: { bg: '#f8d7da', border: '#f5c2c7', text: '#842029', hoverBg: '#f1c1c6', hoverBorder: '#e6aeb4' },
  add: { bg: '#e2e3e5', border: '#d3d6d8', text: '#41464b', hoverBg: '#d1d3d5', hoverBorder: '#c1c4c6' },
  default: { bg: '#f8f9fa', border: '#ced4da', text: '#495057', hoverBg: '#e9ecef', hoverBorder: '#adb5bd' },
};

const getButtonColors = (actionText) => {
  const lowerCaseText = actionText.toLowerCase();
  if (lowerCaseText.includes('save')) return colors.save;
  if (lowerCaseText.includes('export')) return colors.export;
  if (lowerCaseText.includes('import')) return colors.import;
  if (lowerCaseText.includes('clear')) return colors.clear;
  if (lowerCaseText.includes('add')) return colors.add;
  return colors.default;
};

const Navbar = forwardRef(({
  isVisible,
  onExportJson,
  isSaving,
  saveStatus,
  isClearing,
  clearStatus,
  onBack
}, ref) => {
  const [hoveredButton, setHoveredButton] = useState(null);
  const fileInputRef = useRef(null);

  const getButtonStyle = (text, disabled = false) => {
    const buttonColors = getButtonColors(text);
    const isHovered = !disabled && hoveredButton === text;
    let base = {
      backgroundColor: isHovered ? buttonColors.hoverBg : buttonColors.bg,
      borderColor: isHovered ? buttonColors.hoverBorder : buttonColors.border,
      color: buttonColors.text
    };
    if (disabled) {
      base = {
        ...base,
        cursor: 'not-allowed',
        opacity: 0.6,
        backgroundColor: buttonColors.bg,
        borderColor: buttonColors.border
      };
    }
    return base;
  };

  const handleButtonClick = (action) => {
    if (action === 'Export as JSON' && onExportJson) {
      onExportJson();
    } else if (action === '<- Back To Dashboard') {
      onBack();
    }
  };



  return (
    <nav
      ref={ref}
      className={`pl-[25px] pr-[25px] bg-white border-b border-gray-200 shadow-sm flex items-center justify-between flex-wrap gap-[15px] overflow-hidden transition-all duration-300 ease-in-out ${
        isVisible ? 'max-h-[500px] pt-3 pb-3 border-b-[1px]' : 'max-h-0 pt-0 pb-0 border-b-0'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept=".json,application/json"
        className="hidden"
      />
      <div className="flex items-center gap-[12px]">
        <span className="text-[1.6em] font-semibold text-[#333] mr-[30px]">Knowledge Graph</span>
        {['<- Back To Dashboard', 'Export as JSON'].map((text) => (
          <button
            key={text}
            style={getButtonStyle(text)}
            onClick={() => handleButtonClick(text)}
            onMouseEnter={() => setHoveredButton(text)}
            onMouseLeave={() => setHoveredButton(null)}
            className="px-4 py-2 rounded text-sm border transition-all duration-200 whitespace-nowrap"
          >
            {text}
          </button>
        ))}
      </div>
    </nav>
  );
});

export default Navbar;
