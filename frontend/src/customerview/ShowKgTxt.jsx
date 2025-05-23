const ShowKgTxt = ({ selectedKgtxt,state }) => {
    return (
      <div className={`h-[calc(100vh-64px)] p-2 flex flex-col overflow-hidden ${state=='Incomming_kg'?'w-3/5':'w-2/5'}`}>
        <h3 className="text-gray-800 mb-2 text-sm font-semibold">Knowledge Graph Narrative</h3>
        <div className="overflow-y-auto bg-gray-100 p-2 rounded text-sm text-gray-700 whitespace-pre-wrap">
          {selectedKgtxt ? selectedKgtxt : "No Knowledge Graph Narrative available!"}
        </div>
      </div>
    );
  };
  
  export default ShowKgTxt;
  