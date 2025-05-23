const PdfViewer = ({ fileKey }) => {
  if (!fileKey) return <p>No document selected.</p>;

  const pdfUrl = `${
    import.meta.env.VITE_API_URL
  }/api/s3/get-doc?key=${encodeURIComponent(fileKey)}`;

  return (
    <div className="w-3/5 h-[calc(100vh-64px)]">
      <iframe
        src={pdfUrl}
        title="PDF Viewer"
        className="w-full h-full border rounded"
      ></iframe>
    </div>
  );
};

export default PdfViewer;
