import axios from "axios";

const UserMessageList = ({ messages, selectedUser, setSelectedMessage }) => {
  const handleMessageClick = async (key) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/s3/get-message`,
        {
          params: { key },
        }
      );
      setSelectedMessage(response.data.transcript);
    } catch (error) {
      console.error("Error fetching transcript:", error);
    }
  };
  return (
    <div className="p-4 border-r w-1/4 overflow-y-auto h-[calc(100vh-64px)]">
      {messages.length === 0 && (
        <p className="text-sm text-gray-500">No messages found.</p>
      )}
      <ul className="space-y-2">
        {messages.map((msg, idx) => (
          <li
            key={idx}
            className="cursor-pointer p-2 rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => handleMessageClick(msg.Key)}
          >
            <div className="text-sm font-mono break-all">
              {msg.Key.split("/").pop()}
            </div>
            <div className="text-xs text-gray-600">
              {new Date(msg.LastModified).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserMessageList;
