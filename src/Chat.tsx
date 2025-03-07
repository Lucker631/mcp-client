// src/Chat.tsx
import React, { useState, useRef, useEffect } from "react";
import { getStreamingResponse } from "../api/openai";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const Chat: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userInput = input.trim();
    setInput("");

    // Create a unique ID for the user message
    const userMessageId = `user-${Date.now()}`;
    // Create a unique ID for the assistant message
    const assistantMessageId = `assistant-${Date.now()}`;

    // Add user message
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, role: "user", content: userInput },
    ]);

    // Add empty assistant message that will be filled with streaming content
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);

    setIsStreaming(true);

    try {
      // Start streaming
      await getStreamingResponse(userInput, (chunk) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: msg.content + chunk }
              : msg
          )
        );
      });
    } catch (error) {
      console.error("Error streaming response:", error);
      // Update the assistant message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: "[Error: Failed to get response from OpenAI]" }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-80vh max-w-3xl mx-auto border border-gray-300 rounded-lg overflow-hidden shadow-md">
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 bg-gray-100">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] p-3 rounded-2xl break-words whitespace-pre-wrap ${
              msg.role === "user"
                ? "self-end bg-blue-500 text-white rounded-br-sm"
                : "self-start bg-white text-gray-800 rounded-bl-sm shadow"
            }`}
          >
            <div className="leading-relaxed">
              {msg.content ||
                (msg.role === "assistant" && isStreaming ? (
                  <span className="inline-block w-5 text-center animate-pulse">
                    ...
                  </span>
                ) : (
                  ""
                ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex p-3 bg-white border-t border-gray-200"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isStreaming}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-full outline-none focus:border-blue-500 text-base"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="ml-2 px-5 py-3 bg-blue-500 text-white rounded-full text-base cursor-pointer transition-colors hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isStreaming ? "Streaming..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default Chat;
