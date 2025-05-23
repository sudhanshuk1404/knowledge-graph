const OutgoingCallsList = ({ outgoingCalls , receiver, onSelectReceiver}) => {
  return (
    <div
      className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-100 rounded-lg shadow p-2 w-1/5
                    scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-100"
    >
    {outgoingCalls.length==0?<div>No outgoing caller found!</div>:
      <ul className="list-none m-0 p-0">
        {outgoingCalls.map((user, idx) => {
          const isActive = receiver === user;
          return (
            <li
              key={`user-${idx}`}
              className={`flex items-center justify-between px-5 py-3 my-1 mx-2 rounded-md cursor-pointer text-base transition 
                         shadow-sm ${
                           isActive
                             ? "bg-gradient-to-r from-indigo-600 to-indigo-300 text-white font-semibold shadow-md"
                             : "bg-white text-gray-800 hover:bg-indigo-100 hover:text-indigo-600"
                         }`}
              onClick={() => onSelectReceiver(user)}
            >
              <span className="mr-3 text-xl">👨‍💼</span>
              <span className="flex-1 font-medium tracking-wide">{user}</span>
              <span className="ml-3 text-lg">{isActive ? "▼" : "▶"}</span>
            </li>
          );
        })}
      </ul>}
    </div>
  );
};

export default OutgoingCallsList;
