/**
 * Parses an imported JSON schema file and converts it to graph data format
 * that can be rendered by the application.
 * 
 * @param {object} jsonSchema - The parsed JSON schema object with entity_types and predicates
 * @returns {object} - Object with nodes and links arrays for graph rendering
 */
export function parseJsonSchema(jsonSchema) {
  const result = {
    nodes: [],
    links: []
  };
  
  // Track node IDs to avoid duplicates
  const nodeIds = new Set();
  
  // Generate unique ID for a node based on its type
  const generateNodeId = (type, index) => {
    let baseId = `${type}_${index}`;
    // Ensure ID is unique if there are conflicts
    let id = baseId;
    let counter = 1;
    while (nodeIds.has(id)) {
      id = `${baseId}_${counter}`;
      counter++;
    }
    nodeIds.add(id);
    return id;
  };
  
  // Generate unique IDs for edge relationships
  const generateEdgeId = (source, target, type) => {
    return `${source}_${type}_${target}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  };
  
  // Create nodes from entity_types
  if (jsonSchema.entity_types) {
    Object.entries(jsonSchema.entity_types).forEach(([entityType, attributes], index) => {
      const nodeId = generateNodeId(entityType, index);
      
      // Create a node with the properties from the schema (without values)
      const node = {
        id: nodeId,
        label: entityType
      };
      
      // Add schema-defined attributes as properties with empty strings
      if (Array.isArray(attributes)) {
        attributes.forEach(attr => {
          node[attr] = "";
        });
      }
      
      result.nodes.push(node);
    });
  }
  
  // Create links from predicates
  if (jsonSchema.predicates) {
    Object.entries(jsonSchema.predicates).forEach(([predicateType, predicate]) => {
      // Handle both string and array formats for subject_type and object_type
      const subjectTypes = Array.isArray(predicate.subject_type) 
        ? predicate.subject_type 
        : [predicate.subject_type];
      
      const objectTypes = Array.isArray(predicate.object_type)
        ? predicate.object_type
        : [predicate.object_type];
      
      // For each subject and object type combination, create a link
      subjectTypes.forEach(subjectType => {
        // Find source nodes with this type
        const sourceNodes = result.nodes.filter(node => node.label === subjectType);
        
        objectTypes.forEach(objectType => {
          // Find target nodes with this type
          const targetNodes = result.nodes.filter(node => node.label === objectType);
          
          // Connect the first node of each type (as an example)
          if (sourceNodes.length > 0 && targetNodes.length > 0) {
            const sourceNode = sourceNodes[0];
            const targetNode = targetNodes[0];
            
            // Create the link
            const link = {
              id: generateEdgeId(sourceNode.id, targetNode.id, predicateType),
              source: sourceNode.id,
              target: targetNode.id,
              label: predicateType
            };
            
            // Add attributes with empty values
            if (Array.isArray(predicate.attributes)) {
              predicate.attributes.forEach(attr => {
                link[attr] = "";
              });
            }
            
            result.links.push(link);
          }
        });
      });
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
        const jsonSchema = JSON.parse(event.target.result);
        
        // Basic validation of schema structure
        if (!jsonSchema.entity_types || !jsonSchema.predicates) {
          reject(new Error("Invalid schema format: missing entity_types or predicates"));
          return;
        }
        
        // Convert the schema to graph data format
        const graphData = parseJsonSchema(jsonSchema);
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