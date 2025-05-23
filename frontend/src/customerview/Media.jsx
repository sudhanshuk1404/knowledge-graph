import React from 'react';
import axios from 'axios';

const trim = (path) => path.split('/').pop();

const Media = ({ media, setAudioUrl, setTranscript}) => {
  const playCallRecording = async (key) => {
    setTranscript(null);
    setAudioUrl(null);
    console.log("media",media)
    try {
      const response = await axios.get('/api/s3/get-call-recording', {
        params: { key }
      });
      setAudioUrl(response.data.url);
    } catch (error) {
      console.error("Error fetching call recording:", error);
    }
    
  };

  const showTranscript = async (key) => {
    setAudioUrl(null);
    setTranscript(null);
    try {
      const response = await axios.get('/api/s3/get-transcript', {
        params: { key }
      });
      setTranscript(response.data.transcript);
    } catch (error) {
      console.error("Error fetching transcript:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] p-2 flex flex-col w-1/5 overflow-hidden">
      <h3 className="text-gray-800 mb-2 text-sm font-semibold shrink-0">
        Call Records
      </h3>
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 min-h-0">
        {media.calls && media.calls.length > 0 ? (
          <ul className="list-none p-0 m-0 h-full">
            {media.calls.map((call, idx) => (
              <li key={idx} className="bg-white rounded-lg p-1 mb-1 shadow transition-transform hover:translate-x-1">
                <div
                  className="flex items-center py-2 cursor-pointer"
                  onClick={() => playCallRecording(call.key)}
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md mr-1.5">
                    🎵
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-800 font-medium mb-1">{trim(call.key)}</div>
                    <div className="text-gray-500 text-sm">
                      {call.date ? new Date(call.date).toLocaleString() : "N/A"}
                    </div>
                  </div>
                </div>
                {media.transcripts[idx] && 
                <div
                  className="flex items-center border-t border-gray-200 mt-1 pt-1 cursor-pointer"
                  onClick={() => showTranscript(media.transcripts[idx].key)}
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md mr-1.5">
                    📝
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-800 font-medium mb-1">{trim(media.transcripts[idx].key)}</div>
                    <div className="text-gray-500 text-sm">
                      {media.transcripts[idx].date
                        ? new Date(media.transcripts[idx].date).toLocaleString()
                        : "N/A"}
                    </div>
                  </div>
                </div>}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 py-6 bg-gray-100 rounded-lg text-sm">
            No calls found
          </div>
        )}
      </div>
    </div>
  );
};

export default Media;
