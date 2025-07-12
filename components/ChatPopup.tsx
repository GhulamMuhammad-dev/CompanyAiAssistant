"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { SpinnerBallIcon, RobotIcon } from "@phosphor-icons/react";
import ReactMarkdown from "react-markdown";
import {
  PaperPlaneRightIcon,
  SpiralIcon,
} from "@phosphor-icons/react/dist/ssr";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

export default function ChatPopup() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "What kind of AI solutions do you offer?",
    "How can I get started with FoundLabs?",
    "What are your pricing models?",
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          content: "How can I assist you?",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post("/api/chat", { message: input });
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: response.data.response,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: `Sorry, I encountered an error. Please try again or contact foundlabs.online@gmail.com ${error}`,
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 overflow-hidden right-6 z-50">
      {isOpen ? (
        <div className="w-[95vw] sm:w-[370px] h-[500px] flex flex-col bg-[#1f1f1f] text-white rounded-2xl shadow-lg border border-[#444] animate-fade-in">
          {/* Header */}
          <div className="bg-blue-500 text-sm px-4 py-3 font-semibold rounded-t-2xl border-b border-[#444] flex items-center justify-between">
            <span>AI Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-900 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.length === 1 && (
              <div className="space-y-2 mb-4">
                <p className="text-gray-400 text-sm">You can ask me things like:</p>
                <ul className="space-y-2">
                  {suggestedQuestions.map((q, idx) => (
                    <li key={idx}>
                      <button
                        onClick={async () => {
                          setInput(q);
                          await new Promise((r) => setTimeout(r, 100));
                          const fakeSubmit = { preventDefault: () => {} } as React.FormEvent;
                          handleSubmit(fakeSubmit);
                        }}
                        className="bg-gray-800 hover:bg-gray-700 text-left w-full px-3 py-2 text-sm rounded-lg border border-gray-600"
                      >
                        {q}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] px-2 py-3 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm 
                  ${msg.role === "user"
                      ? "bg-blue-200 text-black rounded-br-md"
                      : "bg-blue-800 text-gray-100 border border-gray-700 rounded-bl-md"
                    }`}
                >
                  <div className="prose prose-invert text-sm md:text-base max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  <div className="text-xs mt-2 text-gray-400 text-right">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#2a2a2a] text-gray-300 rounded-xl px-4 py-2 border border-gray-700 text-sm flex items-center gap-2">
                  <SpinnerBallIcon className="animate-spin" size={16} />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-[#444]">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-[#1f1f1f] text-white border border-[#555] rounded-xl px-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-2 flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? (
                  <SpiralIcon size={18} className="animate-spin" />
                ) : (
                  <PaperPlaneRightIcon fill="true" size={18} />
                )}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 text-center">
              AI may make mistakes. Email foundlabs.online@gmail.com for help.
            </p>
          </form>
        </div>
      ) : (
        <button
          id="open-chat-btn"
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg animate-fade-in"
        >
          <RobotIcon fill="true" size={28} />
        </button>
      )}
    </div>
  );
}
