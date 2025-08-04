import { useState } from "react";
import FrequencyControls from "./components/FrequencyControls";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import "./styles/App.css";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-b from-teal-100 to-teal-200 flex flex-col items-center">
        <Navbar />
        <main className="flex-1 w-full max-w-lg p-6">
          <h1 className="text-3xl font-bold text-teal-800 mb-6 text-center">HealWave Pro</h1>
          <FrequencyControls />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;