"use client";

import { RobotIcon } from "@phosphor-icons/react";
import ChatPopup from "./ChatPopup"; // Adjust path based on your folder structure

export default function LandingPage() {
  return (
    <>
      <section className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
          Your Personal AI Assistant
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-6">
          Ask questions, get instant answers, and boost your productivity with
          our smart chatbot powered by AI.
        </p>
        <button
          onClick={() => {
            const chatBtn = document.getElementById("open-chat-btn");
            chatBtn?.click();
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg flex items-center gap-2"
        >
          <RobotIcon size={22} /> Try the Assistant
        </button>
      </section>

      <ChatPopup />
    </>
  );
}
