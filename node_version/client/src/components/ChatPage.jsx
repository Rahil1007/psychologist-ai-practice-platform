import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const personaMeta = {
  easy: {
    label: "Easy Mode",
    color: "bg-gradient-to-br from-blue-500 to-indigo-600",
    avatar: "😊",
    accent: "from-blue-50 to-indigo-100",
    glow: "shadow-blue-500/20",
    border: "border-blue-200"
  },
  hard: {
    label: "Challenge Mode",
    color: "bg-gradient-to-br from-rose-500 to-pink-600",
    avatar: "😤",
    accent: "from-rose-50 to-pink-100",
    glow: "shadow-rose-500/20",
    border: "border-rose-200"
  }
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }}></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }}></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
      </div>
      <span className="text-gray-500 text-sm italic">Patient is typing...</span>
    </div>
  );
}

function MessageBubble({ msg, isOwn, avatar, timestamp, color }) {
  return (
    <div className={`flex items-end gap-3 mb-4 ${isOwn ? "justify-end" : ""} animate-fadeIn`}>
      {!isOwn && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
          <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg">
            <span className="text-2xl">{avatar}</span>
          </div>
        </div>
      )}
      <div className={`group relative max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
        <div className={`
          relative px-5 py-3 rounded-2xl shadow-lg backdrop-blur-sm
          ${isOwn 
            ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-sm" 
            : "bg-white/90 text-gray-800 rounded-bl-sm border border-gray-100"
          }
          transform transition-all duration-200 hover:scale-[1.02]
        `}>
          <div className="relative z-10">
            <div className="whitespace-pre-line leading-relaxed">{msg.content}</div>
            <div className={`text-xs mt-2 ${isOwn ? "text-indigo-100" : "text-gray-400"}`}>
              {timestamp}
            </div>
          </div>
          {isOwn && (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl rounded-br-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          )}
        </div>
      </div>
      {isOwn && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
          <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg">
            <span className="text-2xl">👨‍⚕️</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage({ persona, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [currentStream, setCurrentStream] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const s = io("http://localhost:5000", { transports: ["websocket"] });
    setSocket(s);
    s.emit("start_session", persona);
    setMessages([]);
    setCurrentStream("");
    return () => s.disconnect();
  }, [persona]);

  useEffect(() => {
    if (!socket) return;
    socket.on("response_chunk", (chunk) => {
      setIsTyping(true);
      setCurrentStream((prev) => prev + chunk);
    });
    socket.on("response_complete", () => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "patient",
          content: currentStream + "",
          ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ]);
      setCurrentStream("");
    });
    socket.on("error", (err) => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "patient", content: "Error: " + err, ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    });
    return () => {
      socket.off("response_chunk");
      socket.off("response_complete");
      socket.off("error");
    };
  }, [socket, currentStream]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, currentStream]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    setMessages((prev) => [
      ...prev,
      {
        role: "therapist",
        content: input,
        ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
    ]);
    socket.emit("message", input);
    setInput("");
    setCurrentStream("");
    setIsTyping(true);
  };

  const handleInputKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const meta = personaMeta[persona];

  return (
    <div className={`flex flex-col min-h-screen bg-gradient-to-br ${meta.accent} relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-300/20 to-indigo-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col h-[85vh] border border-white/50">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white/50 backdrop-blur-sm rounded-t-3xl">
            <button 
              onClick={onBack} 
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200 group"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`absolute inset-0 ${meta.color} rounded-full blur-lg opacity-50`}></div>
                <div className={`relative w-12 h-12 ${meta.color} rounded-full flex items-center justify-center text-white shadow-lg`}>
                  <span className="text-2xl">{meta.avatar}</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  AI Therapy Session
                </h2>
                <span className={`text-sm ${persona === 'easy' ? 'text-blue-600' : 'text-rose-600'} font-medium`}>
                  {meta.label}
                </span>
              </div>
            </div>

            <div className="w-20"></div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white/50">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">Start the conversation</p>
                  <p className="text-gray-400 text-sm mt-2">Your patient is waiting...</p>
                </div>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <MessageBubble
                key={i}
                msg={msg}
                isOwn={msg.role === "therapist"}
                avatar={msg.role === "therapist" ? "👨‍⚕️" : meta.avatar}
                timestamp={msg.ts}
                color={meta.color}
              />
            ))}
            
            {isTyping && (
              <div className="animate-fadeIn">
                <TypingIndicator />
                {currentStream && (
                  <div className="ml-13 bg-white/90 backdrop-blur-sm text-gray-800 px-5 py-3 rounded-2xl rounded-bl-sm max-w-[70%] shadow-lg border border-gray-100 animate-pulse">
                    {currentStream}
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-100 bg-white/50 backdrop-blur-sm rounded-b-3xl">
            <div className="flex gap-3">
              <div className="flex-1 relative group">
                <textarea
                  className="w-full border-2 border-gray-200 rounded-2xl px-5 py-3 pr-12 resize-none focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleInputKey}
                  disabled={isTyping}
                  rows="1"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                  autoFocus
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ⏎
                </div>
              </div>
              <button
                className={`
                  px-6 py-3 rounded-2xl font-medium transition-all duration-200 transform
                  ${isTyping || !input.trim() 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                  }
                `}
                onClick={sendMessage}
                disabled={isTyping || !input.trim()}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}