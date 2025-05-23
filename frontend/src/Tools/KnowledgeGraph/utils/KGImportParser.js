/**
 * Parses an imported JSON file with entities and relationships 
 * and converts it to graph data format for rendering.
 * 
 * @param {object} jsonData - JSON data with entities and relationships
 * @returns {object} - Object with nodes and links arrays for graph rendering
 */
export function parseJsonSchema(jsonData) {
  const result = {
    nodes: [],
    links: []
  };
  
  // Process entities into nodes
  if (jsonData.entities && Array.isArray(jsonData.entities)) {
    jsonData.entities.forEach(entity => {
      if (!entity.id || !entity.type) return;
      
      // Create a node from the entity
      const node = {
        id: entity.id,
        label: entity.type,
        // Add all attributes from the entity
        ...(entity.attributes || {})
      };
      
      result.nodes.push(node);
    });
  }
  
  // Process relationships into links
  if (jsonData.relationships && Array.isArray(jsonData.relationships)) {
    jsonData.relationships.forEach((relationship, index) => {
      if (!relationship.predicate || !relationship.subject || !relationship.object) return;
      
      // Create a link from the relationship
      const link = {
        id: `link_${index}_${Date.now()}`,
        source: relationship.subject,
        target: relationship.object,
        label: relationship.predicate,
        // Add all attributes from the relationship
        ...(relationship.attributes || {})
      };
      
      result.links.push(link);
    });
  }
  
  return result;
}

/**
 * Handles file input and reads the JSON file.
 * 
 * @param {File} file - The uploaded JSON file
 * @returns {Promise<object>} - Promise that resolves to the parsed graph data
 */
export function handleJsonFileUpload(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file selected"));
      return;
    }
    
    // Validate file type
    if (!file.type.match('application/json') && !file.name.endsWith('.json')) {
      reject(new Error("Selected file is not a JSON file"));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        
        // Basic validation of data structure
        if (!jsonData.entities || !jsonData.relationships) {
          reject(new Error("Invalid format: missing entities or relationships"));
          return;
        }
        
        // Convert the data to graph data format
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