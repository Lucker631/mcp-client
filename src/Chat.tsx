// src/Chat.tsx
import React, { useState, useRef, useEffect } from "react";
import { getStreamingResponse } from "../api/openai";
import "./Chat.css";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SseClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

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
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${
              msg.role === "user" ? "user-message" : "assistant-message"
            }`}
          >
            <div className="message-content">
              {msg.content ||
                (msg.role === "assistant" && isStreaming ? (
                  <span className="typing-indicator">...</span>
                ) : (
                  ""
                ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isStreaming}
          className="message-input"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="send-button"
        >
          {isStreaming ? "Streaming..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default Chat;
