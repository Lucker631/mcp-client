import "./App.css";
import Chat from "./Chat";

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>OpenAI Streaming Chat</h1>
        <p>Ask anything and get streaming responses from GPT</p>
      </header>
      <main>
        <Chat />
      </main>
      <footer>
        <p>Powered by OpenAI API</p>
      </footer>
    </div>
  );
}

export default App;
