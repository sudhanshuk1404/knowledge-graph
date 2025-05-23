import React, { useState, useEffect } from "react";
import axios from "axios";
import UserList from "./UserList";
import Media from "./Media";
import PlayRecording from "./PlayRecording";
import ShowTranscript from "./ShowTranscript";
import UserMessageList from "./UserMessageList";
import MessageView from "./MessageView";
import DocsList from "./DocsList";
import PdfViewer from "./PdfViewer";
import OutgoingCallsList from "./OutgoingCallsList";
import KGList from "./KGList";
import ShowKgTxt from "./ShowKgTxt";
import ShowKgJson from "./ShowKgJson";
import ReciverKgList from "./ReciverKgList";

const TestView = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [media, setMedia] = useState(null);
  const [outgoingCalls, setOutgoingCalls] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [state, setState] = useState(null);
  const [messages, setMessages] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [docs, setDocs] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [kg, setKg] = useState(null);
  const [selectedKgtxt, setSelectedKgtxt] = useState(null);
  const [selectedKgJson, setSelectedKgJson] = useState(null);
  const [reciverKgList, setReceiverKgList] = useState(null);

  const handleIncommingCallsMedia = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/s3/get-incomming-media`,
        {
          params: { selectedUser: selectedUser },
        }
      );
      setAudioUrl(null);
      setTranscript(null);
      setReceiver(null);
      setMessages(null);
      setSelectedMessage(null);
      setDocs(null);
      setSelectedDoc(null);
      setOutgoingCalls(null);
      setKg(null);
      setSelectedKgtxt(null);
      setSelectedKgJson(null);
      setReceiverKgList(null);
      setMedia(response.data);
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setState("Incoming_media");
    }
  };

  const handleIncomingKG = async () => {
    try {
      const response = await axios.get("/api/s3/get-incoming-kg", {
        params: { selectedUser: selectedUser },
      });
      setMedia(null);
      setAudioUrl(null);
      setTranscript(null);
      setReceiver(null);
      setMessages(null);
      setSelectedMessage(null);
      setDocs(null);
      setSelectedDoc(null);
      setOutgoingCalls(null);
      setReceiverKgList(null);
      setSelectedKgtxt(null);
      setSelectedKgJson(null);
      setKg(response.data.kg);
    } catch (error) {
      console.error("Error fetching Incomming KG:", error);
    } finally {
      setState("Incomming_kg");
    }
  };

  const handleOutgoingKG = async () => {
    try {
      const response = await axios.get("/api/s3/get-outgoing-kg-recivers", {
        params: { selectedUser: selectedUser },
      });
      setMedia(null);
      setAudioUrl(null);
      setTranscript(null);
      setReceiver(null);
      setMessages(null);
      setSelectedMessage(null);
      setDocs(null);
      setSelectedDoc(null);
      setOutgoingCalls(null);
      setReceiver(null);
      setKg(null);
      setSelectedKgtxt(null);
      setSelectedKgJson(null);
      setReceiverKgList(response.data.kgRecivers);
    } catch (error) {
      console.error("Error fetching Outgoing KG:", error);
    } finally {
      setState("Outgoing_kg");
    }
  };

  const handleUserMessages = async () => {
    try {
      const response = await axios.get("/api/s3/get-user-messages", {
        params: { selectedUser: selectedUser },
      });
      setMessages(response.data);
      setMedia(null);
      setAudioUrl(null);
      setTranscript(null);
      setSelectedMessage(null);
      setDocs(null);
      setSelectedDoc(null);
      setOutgoingCalls(null);
      setReceiver(null);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setState("User_messages");
    }
  };

  const handleDocs = async () => {
    try {
      const response = await axios.get("/api/s3/get-docs", {
        params: { selectedUser: selectedUser },
      });
      setDocs(response.data);
      setMedia(null);
      setAudioUrl(null);
      setTranscript(null);
      setMessages(null);
      setSelectedMessage(null);
      setSelectedDoc(null);
      setOutgoingCalls(null);
      setReceiver(null);
    } catch (error) {
      console.error("Error fetching docs:", error);
    } finally {
      setState("User_docs");
    }
  };

  const handleOutgoingCalls = async () => {
    try {
      const response = await axios.get("/api/s3/get-outgoing-calls", {
        params: { selectedUser: selectedUser },
      });
      setOutgoingCalls(response.data);
      setMedia(null);
      setAudioUrl(null);
      setTranscript(null);
      setMessages(null);
      setSelectedMessage(null);
      setDocs(null);
      setSelectedDoc(null);
      setReceiver(null);
    } catch (error) {
      console.error("Error fetching Outgoing Calls:", error);
    } finally {
      setState("Outgoing_calls");
    }
  };

  const onSelect = (newuser) => {
    setSelectedUser((prev) => (prev === newuser ? null : newuser));
    setState(null);
    setMedia(null);
    setAudioUrl(null);
    setTranscript(null);
    setMessages(null);
    setSelectedMessage(null);
    setDocs(null);
    setSelectedDoc(null);
    setReceiver(null);
  };

  const onSelectReceiver = async (newreceiver) => {
    setReceiver((prev) => (prev === newreceiver ? null : newreceiver));
    setMedia(null);
    setAudioUrl(null);
    setTranscript(null);
    setMessages(null);
    setSelectedMessage(null);
    setDocs(null);
    setSelectedDoc(null);
    if (receiver != newreceiver) {
      try {
        const response = await axios.get("/api/s3/get-outgoing-media", {
          params: { selectedUser: selectedUser, receiver: newreceiver },
        });
        setMedia(response.data);
      } catch (error) {
        console.error("Error fetching media:", error);
      }
    }
  };

  return (
    <div>
      <div className="bg-sky-500/90 p-4 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between rounded-lg h-16">
        {/* Customer View Section */}
        <div className="flex items-center text-white mb-4 md:mb-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-xl font-semibold">Customer View</span>
        </div>

        {/* Action Buttons Section - Appears if selectedUser is true */}
        {selectedUser && (
          <div className="flex flex-wrap justify-center md:justify-end gap-2 md:gap-3">
            {/* Incoming Calls Button */}
            <button
              type="button"
              className={`flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transform hover:scale-[1.02] active:scale-[0.98] ${
                state === "Incomming_media"
                  ? "ring-4 ring-blue-300 font-bold scale-105"
                  : ""
              }`}
              onClick={handleIncommingCallsMedia}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Incoming calls
            </button>
            <button
              type="button"
              className={`flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transform hover:scale-[1.02] active:scale-[0.98] ${
                state === "Incomming_media"
                  ? "ring-4 ring-blue-300 font-bold scale-105"
                  : ""
              }`}
              onClick={handleIncomingKG}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Incoming KG
            </button>

            {/* Outgoing Calls Button */}
            <button
              type="button"
              className={`flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-md shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transform hover:scale-[1.02] active:scale-[0.98] ${
                state === "Outgoing_calls"
                  ? "ring-4 ring-indigo-300 font-bold scale-105"
                  : ""
              }`}
              onClick={handleOutgoingCalls}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 3h5m0 0v5m0-5l-6 6M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
                />
              </svg>
              Outgoing calls
            </button>
            <button
              type="button"
              className={`flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-md shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transform hover:scale-[1.02] active:scale-[0.98] ${
                state === "Outgoing_calls"
                  ? "ring-4 ring-indigo-300 font-bold scale-105"
                  : ""
              }`}
              onClick={handleOutgoingKG}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 3h5m0 0v5m0-5l-6 6M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
                />
              </svg>
              Outgoing KG
            </button>

            {/* User SMS Button */}
            <button
              type="button"
              className={`flex items-center justify-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-md shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75 transform hover:scale-[1.02] active:scale-[0.98] ${
                state === "User_messages"
                  ? "ring-4 ring-emerald-300 font-bold scale-105"
                  : ""
              }`}
              onClick={handleUserMessages}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              User sms
            </button>

            {/* Docs Button */}
            <button
              type="button"
              className={`flex items-center justify-center px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white rounded-md shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-opacity-75 transform hover:scale-[1.02] active:scale-[0.98] ${
                state === "User_docs"
                  ? "ring-4 ring-violet-300 font-bold scale-105"
                  : ""
              }`}
              onClick={handleDocs}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Docs
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-row">
        <UserList onSelect={onSelect} selectedUser={selectedUser} />
        {state === "Incoming_media" ? (
          <>
            <Media
              media={media}
              setAudioUrl={setAudioUrl}
              setTranscript={setTranscript}
            />
            {audioUrl && <PlayRecording audioUrl={audioUrl} state={state} />}
            {transcript && (
              <ShowTranscript transcript={transcript} state={state} />
            )}
          </>
        ) : state === "User_messages" ? (
          <>
            <UserMessageList
              messages={messages}
              selectedUser={selectedUser}
              setSelectedMessage={setSelectedMessage}
            />
            {selectedMessage && (
              <MessageView selectedMessage={selectedMessage} />
            )}
          </>
        ) : state === "User_docs" ? (
          <>
            <DocsList
              selectedUser={selectedUser}
              docs={docs}
              setSelectedDoc={setSelectedDoc}
            />
            {selectedDoc && <PdfViewer fileKey={selectedDoc} />}
          </>
        ) : state === "Outgoing_calls" ? (
          <>
            <OutgoingCallsList
              outgoingCalls={outgoingCalls}
              receiver={receiver}
              onSelectReceiver={onSelectReceiver}
              setMedia={setMedia}
            />
            {media && (
              <>
                <Media
                  media={media}
                  setAudioUrl={setAudioUrl}
                  setTranscript={setTranscript}
                />
                {audioUrl && (
                  <PlayRecording audioUrl={audioUrl} state={state} />
                )}
                {transcript && (
                  <ShowTranscript transcript={transcript} state={state} />
                )}
              </>
            )}
          </>
        ) : state === "Incomming_kg" ? (
          <>
            <KGList
              kg={kg}
              setSelectedKgtxt={setSelectedKgtxt}
              setSelectedKgJson={setSelectedKgJson}
            />
            {selectedKgtxt && (
              <ShowKgTxt selectedKgtxt={selectedKgtxt} state={state} />
            )}
            {selectedKgJson && (
              <ShowKgJson selectedKgJson={selectedKgJson} state={state} />
            )}
          </>
        ) : state === "Outgoing_kg" ? (
          <>
            <ReciverKgList
              reciverKgList={reciverKgList}
              setKg={setKg}
              setSelectedKgtxt={setSelectedKgtxt}
              setSelectedKgJson={setSelectedKgJson}
            />
            {kg && (
              <>
                <KGList
                  kg={kg}
                  setSelectedKgtxt={setSelectedKgtxt}
                  setSelectedKgJson={setSelectedKgJson}
                />
                {selectedKgtxt && (
                  <ShowKgTxt selectedKgtxt={selectedKgtxt} state={state} />
                )}
                {selectedKgJson && (
                  <ShowKgJson selectedKgJson={selectedKgJson} state={state} />
                )}
              </>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default TestView;
