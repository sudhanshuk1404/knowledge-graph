/**
 * Generates a JSON object with entities and relationships from graph data.
 * @param {object} graphData - Object containing 'nodes' and 'links' arrays.
 * @returns {object} - The generated JSON with entities and relationships.
 */
export function generateLpgSchema(graphData) {
  // Initialize the result object with entities and relationships
  const result = {
    entities: [],
    relationships: []
  };

  // Define sets of internal properties to ignore for nodes and links
  const internalNodeProps = new Set([
    'id', 'label', 'x', 'y', 'vx', 'vy', 'index', 'fx', 'fy', '__indexColor'
  ]);

  const internalLinkProps = new Set([
    'id', 'label', 'source', 'target', 'index', '__controlPoints', '__indexColor'
  ]);

  // Process Nodes: Convert to entities
  graphData.nodes.forEach(node => {
    if (!node.id || !node.label) return; // Skip nodes without IDs or labels

    // Extract attributes (all non-internal properties)
    const attributes = {};
    Object.entries(node).forEach(([key, value]) => {
      if (!internalNodeProps.has(key)) {
        attributes[key] = value;
      }
    });

    // Create an entity
    const entity = {
      id: node.id,
      type: node.label,
      attributes
    };

    result.entities.push(entity);
  });

  // Process Links: Convert to relationships
  graphData.links.forEach(link => {
    if (!link.label || !link.source || !link.target) return; // Skip incomplete links

    // Handle source/target whether they're objects or IDs
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;

    // Extract attributes (all non-internal properties)
    const attributes = {};
    Object.entries(link).forEach(([key, value]) => {
      if (!internalLinkProps.has(key)) {
        attributes[key] = value;
      }
    });

    // Create a relationship
    const relationship = {
      predicate: link.label,
      subject: sourceId,
      object: targetId,
      attributes
    };

    result.relationships.push(relationship);
  });

  return result;
}

/**
 * Triggers a browser download for the given data as a JSON file.
 * @param {object} data - The Javascript object to download.
 * @param {string} filename - The desired name for the downloaded file.
 */
export function downloadJson(data, filename) {
  // Ensure the filename ends with .json
  if (!filename.toLowerCase().endsWith('.json')) {
    filename += '.json';
  }
  // Convert the data to a pretty-printed JSON string
  const jsonString = JSON.stringify(data, null, 2); // Pretty print JSON
  // Create a Blob from the JSON string
  const blob = new Blob([jsonString], { type: 'application/json' });
  // Create a temporary URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element to trigger the download
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a); // Append anchor to body (required for firefox)
  a.click();
  document.body.removeChild(a); // Remove anchor from body
  URL.revokeObjectURL(url); // Free up memory
}

/**
 * For compatibility - just calls parseJsonSchema from KGImportParser
 * @param {object} jsonData - JSON data to parse
 * @returns {object} Graph data
 */
export function parseJsonSchema(jsonData) {
  // This would normally import from KGImportParser, but since we're showing them separately:
  // For entities and relationships format
  const result = {
    nodes: [],
    links: []
  };
  
  // Process entities into nodes
  if (jsonData.entities && Array.isArray(jsonData.entities)) {
    jsonData.entities.forEach(entity => {
      if (!entity.id || !entity.type) return;
      
      const node = {
        id: entity.id,
        label: entity.type,
        ...(entity.attributes || {})
      };
      
      result.nodes.push(node);
    });
  }
  
  // Process relationships into links
  if (jsonData.relationships && Array.isArray(jsonData.relationships)) {
    jsonData.relationships.forEach((relationship, index) => {
      if (!relationship.predicate || !relationship.subject || !relationship.object) return;
      
      const link = {
        id: `link_${index}_${Date.now()}`,
        source: relationship.subject,
        target: relationship.object,
        label: relationship.predicate,
        ...(relationship.attributes || {})
      };
      
      result.links.push(link);
    });
  }
  
  return result;
}

/**
 * For compatibility - just calls handleJsonFileUpload from KGImportParser
 * @param {File} file - File to upload
 * @returns {Promise<object>} Graph data
 */
export function handleJsonFileUpload(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file selected"));
      return;
    }
    
    if (!file.type.match('application/json') && !file.name.endsWith('.json')) {
      reject(new Error("Selected file is not a JSON file"));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        
        if (!jsonData.entities || !jsonData.relationships) {
          reject(new Error("Invalid format: missing entities or relationships"));
          return;
        }
        
        const graphData = parseJsonSchema(jsonData);
        resolve(graphData);
      } catch (error) {
        reject(new Error(`Error parsing JSON file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    reader.readAsText(file);
  });
} 