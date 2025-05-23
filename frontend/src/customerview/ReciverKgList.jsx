import React, { useEffect, useState } from "react";
import axios from "axios";
const ReciverKgList = ({
  reciverKgList,
  setKg,
  setSelectedKgtxt,
  setSelectedKgJson,
}) => {
  const [selectedReciverKg, setSelectedReciverKg] = useState(null);
  const fetchKG = async (user) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/s3/get-outgoing-kg`,
        {
          params: { user },
        }
      );
      setKg(response.data.kg);
    } catch (error) {
      console.error("Error fetching call recording:", error);
    }
  };

  const onSelectReciverkg = (user) => {
    if (user === selectedReciverKg) {
      setSelectedReciverKg(null);
      setSelectedKgtxt(null);
      setSelectedKgJson(null);
    } else {
      setSelectedReciverKg(user);
      fetchKG(user);
    }
  };

  return (
    <div
      className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-100 rounded-lg shadow p-2 w-1/5
                    scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-100"
    >
      <ul className="list-none m-0 p-0">
        {reciverKgList.map((user, idx) => {
          const isActive = selectedReciverKg === user;
          return (
            <li
              key={`user-${idx}`}
              className={`flex items-center justify-between px-5 py-3 my-1 mx-2 rounded-md cursor-pointer text-base transition 
                         shadow-sm ${
                           isActive
                             ? "bg-gradient-to-r from-indigo-600 to-indigo-300 text-white font-semibold shadow-md"
                             : "bg-white text-gray-800 hover:bg-indigo-100 hover:text-indigo-600"
                         }`}
              onClick={() => onSelectReciverkg(user)}
            >
              <span className="mr-3 text-xl">👨‍💼</span>
              <span className="flex-1 font-medium tracking-wide">
                {user.split("/")[3]}
              </span>
              <span className="ml-3 text-lg">{isActive ? "▼" : "▶"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ReciverKgList;
