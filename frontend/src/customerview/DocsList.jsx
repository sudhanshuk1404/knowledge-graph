

const DocsList = ({ selectedUser, docs, setSelectedDoc }) => {
  const handleDocClick = async (key) => {
    setSelectedDoc(key);
  };
  return (
    <div className="p-4 border-r w-1/5 overflow-y-auto h-[calc(100vh-64px)]">
      <h2 className="text-lg font-bold mb-3">Docs for {selectedUser}</h2>
      {docs==null?(
        <p className="text-sm text-gray-500">Loading ...</p>
      )
      :docs.length===0?(
        <p className="text-sm text-gray-500">No docs found for {selectedUser}</p>
      ):null}

      <ul className="space-y-2">
        {docs.map((doc, idx) => (
          <li
            key={idx}
            className="cursor-pointer p-2 rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => handleDocClick(doc.Key)}
          >
            <div className="text-sm font-mono break-all">
              {doc.Key.split("/").pop()}
            </div>
            <div className="text-xs text-gray-600">
              {new Date(doc.LastModified).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocsList;
