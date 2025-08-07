import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import ChatPage from "./components/ChatPage";

function App() {
  const [persona, setPersona] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {!persona ? (
        <LandingPage onSelectPersona={setPersona} />
      ) : (
        <ChatPage persona={persona} onBack={() => setPersona(null)} />
      )}
    </div>
  );
}

export default App;
