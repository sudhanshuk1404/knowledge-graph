/**
 * Generates an LPG schema object from graph data (nodes and links).
 * Does not include actual property values, only types and property keys.
 * @param {object} graphData - Object containing 'nodes' and 'links' arrays.
 * @returns {object} - The generated LPG schema object.
 */
export function generateLpgSchema(graphData) {
  // Initialize the schema object with entity_types and predicates
  const schema = {
    entity_types: {},
    predicates: {},
  };

  // Define sets of internal properties to ignore for nodes and links
  const internalNodeProps = new Set([
    'id', 'label', 'x', 'y', 'vx', 'vy', 'index', 'fx', 'fy', '__indexColor'
  ]);

  const internalLinkProps = new Set([
    'id', 'label', 'source', 'target', 'index', '__controlPoints', '__indexColor'
  ]);

  // Process Nodes: Collect property keys for each node label (type)
  graphData.nodes.forEach(node => {
    if (!node.label) return; // Skip nodes without labels for schema

    const label = node.label;
    if (!schema.entity_types[label]) {
      schema.entity_types[label] = new Set();
    }

    // Add all non-internal property keys to the entity type's set
    Object.keys(node).forEach(propKey => {
      if (!internalNodeProps.has(propKey)) {
        schema.entity_types[label].add(propKey);
      }
    });
  });

  // Process Links: Collect property keys and source/target types for each link label (predicate)
  graphData.links.forEach(link => {
    if (!link.label) return; // Skip links without labels for schema

    const label = link.label;
    // Find the source and target node objects for this link
    const sourceNode = graphData.nodes.find(n => n.id === (typeof link.source === 'object' ? link.source.id : link.source));
    const targetNode = graphData.nodes.find(n => n.id === (typeof link.target === 'object' ? link.target.id : link.target));

    // Ensure source and target nodes and their labels exist
    if (!sourceNode || !sourceNode.label || !targetNode || !targetNode.label) {
      console.warn(`Skipping link "${label}" for schema due to missing source/target node or label.`);
      return;
    }

    const sourceLabel = sourceNode.label;
    const targetLabel = targetNode.label;

    // Initialize the predicate entry if it doesn't exist
    if (!schema.predicates[label]) {
      schema.predicates[label] = {
        subject_type: new Set(),
        object_type: new Set(),
        attributes: new Set(),
      };
    }

    // Add the source and target node labels to the predicate's subject/object types
    schema.predicates[label].subject_type.add(sourceLabel);
    schema.predicates[label].object_type.add(targetLabel);

    // Add all non-internal property keys to the predicate's attributes set
    Object.keys(link).forEach(propKey => {
      if (!internalLinkProps.has(propKey)) {
        schema.predicates[label].attributes.add(propKey);
      }
    });
  });

  // Convert Sets to sorted Arrays for final output for entity_types
  Object.keys(schema.entity_types).forEach(entityLabel => {
    schema.entity_types[entityLabel] = Array.from(schema.entity_types[entityLabel]).sort();
  });

  // Convert Sets to sorted Arrays for predicates, and simplify if only one type
  Object.keys(schema.predicates).forEach(predicateLabel => {
    const predicate = schema.predicates[predicateLabel];
    const subjects = Array.from(predicate.subject_type).sort();
    const objects = Array.from(predicate.object_type).sort();

    // Keep as string if only one type, otherwise array
    predicate.subject_type = subjects.length === 1 ? subjects[0] : subjects;
    predicate.object_type = objects.length === 1 ? objects[0] : objects;
    predicate.attributes = Array.from(predicate.attributes).sort();
  });

  // Return the final schema object
  return schema;
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
 * Parses an imported JSON schema file and converts it to graph data format
 * that can be rendered by the application.
 * 
 * @param {object} jsonSchema - The parsed JSON schema object with entity_types and predicates
 * @returns {object} - Object with nodes and links arrays for graph rendering
 */
export function parseJsonSchema(jsonSchema) {
  // Initialize result object to hold nodes and links
  const result = {
    nodes: [],
    links: []
  };
  
  // Track node IDs to avoid duplicates
  const nodeIds = new Set();
  
  // Helper function to generate a unique node ID based on type and index
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
  
  // Helper function to generate a unique edge ID based on source, target, and type
  const generateEdgeId = (source, target, type) => {
    return `${source}_${type}_${target}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  };
  
  // Create nodes from entity_types in the schema
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
  
  // Create links from predicates in the schema
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
            
            // Create the link with schema-defined attributes
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
  
  // Return the constructed graph data
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
    // Reject if no file is provided
    if (!file) {
      reject(new Error("No file selected"));
      return;
    }
    
    // Validate file type (must be JSON)
    if (!file.type.match('application/json') && !file.name.endsWith('.json')) {
      reject(new Error("Selected file is not a JSON file"));
      return;
    }
    
    const reader = new FileReader();
    
    // On successful file read
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
    
    // On file read error
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    // Start reading the file as text
    reader.readAsText(file);
  });
} 