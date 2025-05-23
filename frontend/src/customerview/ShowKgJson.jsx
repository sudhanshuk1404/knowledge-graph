import React, { useState } from "react";
import KgDisplay from "../Tools/ViewKG/KgDisplay";
const ShowKgJson = ({ selectedKgJson, state }) => {
  const [showModal, setShowModal] = useState(false);
  const [kgToDisplay, setKgToDisplay] = useState(null);

  const display = (kg) => {
    setKgToDisplay(kg);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setKgToDisplay(null);
  };

  return (
    <div className={`h-[calc(100vh-64px)] p-2 flex flex-col overflow-hidden ${state === 'Incomming_kg' ? 'w-3/5' : 'w-2/5'}`}>
      <div className="flex flex-row">
        <h3 className="text-gray-800 mb-2 text-sm font-semibold">Knowledge Graph Json</h3>
        <button className="ml-4 px-4 py-1 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors duration-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => { display(selectedKgJson) }}
        >
          Display
        </button>
      </div>
      <div className="overflow-y-auto bg-gray-100 p-2 rounded text-sm text-gray-700 whitespace-pre-wrap">
        {selectedKgJson ? selectedKgJson : "No Knowledge Graph Json available!"}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-[100vw] h-[100vh] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
            <KgDisplay onBack={handleCloseModal} kg={kgToDisplay} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowKgJson;
  