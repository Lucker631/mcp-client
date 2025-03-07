import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Chat from "./Chat";

// App component defined directly in main.tsx
function App() {
  return (
    <div className="flex flex-col min-h-screen px-5 py-5 max-w-7xl mx-auto">
      <header className="text-center mb-5">
        <h1 className="mb-2 text-gray-800">Streaming Chat</h1>
        <p className="text-lg text-gray-600">Ask anything</p>
      </header>
      <main className="flex-1">
        <Chat />
      </main>
      <footer className="mt-8 text-center py-3 text-gray-500 text-sm">
        <p>Fun, ain't it?</p>
      </footer>
    </div>
  );
}

// Initialize React and mount the App
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
