import React, { useEffect, useState } from "react";

const UserList = ({ onSelect, selectedUser }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchIncomingCalls = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/s3/get-users-list`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomingCalls();
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!users.length) return <div>No users found.</div>;

  return (
    <div
      className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-100 rounded-lg shadow p-2 w-1/5
                    scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-100"
    >
      <ul className="list-none m-0 p-0">
        {users.map((user, idx) => {
          const isActive = selectedUser === user;
          return (
            <li
              key={`user-${idx}`}
              className={`flex items-center justify-between px-5 py-3 my-1 mx-2 rounded-md cursor-pointer text-base transition 
                         shadow-sm ${
                           isActive
                             ? "bg-gradient-to-r from-indigo-600 to-indigo-300 text-white font-semibold shadow-md"
                             : "bg-white text-gray-800 hover:bg-indigo-100 hover:text-indigo-600"
                         }`}
              onClick={() => onSelect(user)}
            >
              <span className="mr-3 text-xl">👨‍💼</span>
              <span className="flex-1 font-medium tracking-wide">{user}</span>
              <span className="ml-3 text-lg">{isActive ? "▼" : "▶"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UserList;
