import { useState, useEffect } from 'react';
import { Disclosure } from '@headlessui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Fields to render as Markdown
const markdownFields = ['prompt', 'query', 'response', 'hs'];

// Utility to preprocess strings for non-Markdown fields
const renderStringWithNewlines = (value) => {
  if (typeof value !== 'string') return value;
  return value.split('\n').map((line, index) => (
    <span key={index}>
      {line}
      {index < value.split('\n').length - 1 && <br />}
    </span>
  ));
};

// Custom JSON renderer to handle Markdown and non-Markdown fields
const customJSONRenderer = (data, level = 0) => {
  if (typeof data === 'string') {
    return markdownFields.includes(level === 0 ? data : '') ? (
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{data}</ReactMarkdown>
    ) : (
      renderStringWithNewlines(data)
    );
  }
  if (Array.isArray(data)) {
    return (
      <span>
        [
        {data.map((item, index) => (
          <span key={index}>
            {customJSONRenderer(item, level + 1)}
            {index < data.length - 1 && ', '}
          </span>
        ))}
        ]
      </span>
    );
  }
  if (data && typeof data === 'object') {
    return (
      <div style={{ marginLeft: level * 10 }}>
        {'{'}
        {Object.entries(data).map(([key, value], index) => (
          <div key={key}>
            <span style={{ color: '#007bff' }}>"{key}"</span>:&nbsp;
            {markdownFields.includes(key) ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{String(value)}</ReactMarkdown>
            ) : (
              customJSONRenderer(value, level + 1)
            )}
            {index < Object.entries(data).length - 1 && ','}
          </div>
        ))}
        {'}'}
      </div>
    );
  }
  return JSON.stringify(data);
};

const ShowTranscript = ({ transcript, state }) => {
  const [parsedTranscript, setParsedTranscript] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!transcript) {
      setParsedTranscript([]);
      setComments([]);
      return;
    }

    try {
      // Extract comments (lines starting with *)
      const lines = transcript.split('\n').map(line => line.trim());
      const commentLines = lines.filter(line => line.startsWith('*'));
      const jsonContent = lines.filter(line => !line.startsWith('*') && line).join('\n');

      // Treat comments as Markdown
      setComments(commentLines);

      // Split JSON content into blocks
      const blocks = jsonContent
        .replace(/}\s*{/g, '}|{')
        .split('|')
        .map(block => block.trim())
        .filter(block => block && block !== '\n' && block !== '\r\n');

      const parsed = blocks.map((block, index) => {
        try {
          const cleanedBlock = block.replace(/^\{|\}$/g, '').trim();
          if (!cleanedBlock) return null;

          const jsonString = `{${cleanedBlock}}`;
          const parsedBlock = JSON.parse(jsonString);

          const summary = parsedBlock.query
            ? `Query: ${parsedBlock.query.replace(/(\n|\r\n)/g, ' ').substring(0, 50)}${parsedBlock.query.length > 50 ? '...' : ''}`
            : parsedBlock.prompt
            ? `Prompt: ${parsedBlock.prompt.replace(/(\n|\r\n)/g, ' ').substring(0, 50)}${parsedBlock.prompt.length > 50 ? '...' : ''}`
            : `Block ${index + 1}`;

          return { summary, content: parsedBlock, id: index };
        } catch (error) {
          console.error(`Error parsing block ${index}:`, error);
          return null;
        }
      }).filter(block => block !== null);

      setParsedTranscript(parsed);
    } catch (error) {
      console.error('Error processing transcript:', error);
      setParsedTranscript([]);
      setComments([]);
    }
  }, [transcript]);

  return (
    <div
      className={`h-[calc(100vh-64px)] p-4 flex flex-col overflow-hidden ${
        state === 'Incoming_media' ? 'w-3/5' : 'w-2/5'
      }`}
    >
      <h3 className="text-gray-800 mb-4 text-sm font-semibold">Transcript</h3>
      <div className="overflow-y-auto bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
        {comments.length > 0 && (
          <div className="mb-4 p-2 bg-gray-100 rounded">
            {comments.map((comment, index) => (
              <ReactMarkdown key={index} remarkPlugins={[remarkGfm]}>
                {comment}
              </ReactMarkdown>
            ))}
          </div>
        )}
        {parsedTranscript.length > 0 ? (
          parsedTranscript.map((block) => (
            <Disclosure key={block.id} as="div" className="mb-2">
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-900 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
                    <span>{block.summary}</span>
                    <svg
                      className={`${
                        open ? 'transform rotate-180' : ''
                      } w-5 h-5 text-gray-500`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-700 bg-white rounded-b-lg shadow-inner">
                    <div className="p-2 bg-gray-50 rounded">
                      {customJSONRenderer(block.content)}
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ))
        ) : (
          <p>No transcript available</p>
        )}
      </div>
    </div>
  );
};

export default ShowTranscript;