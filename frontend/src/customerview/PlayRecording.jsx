const PlayRecording = ({ audioUrl, state }) => {
  return (
    <div className={`h-[calc(100vh-64px)] p-2 flex items-center justify-center overflow-hidden ${state === 'Incoming_media' ? 'w-3/5' : 'w-2/5'}`}>
      {audioUrl ? (
        <audio controls className="w-full">
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      ) : (
        <p className="text-sm text-gray-500">Loading audio...</p>
      )}
    </div>
  );
};

export default PlayRecording;
