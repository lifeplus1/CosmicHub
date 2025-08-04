import FrequencyControls from "./components/FrequencyControls";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import "./styles/App.css";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-teal-800 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-white mb-4 tracking-wide">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  HealWave
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-2">Therapeutic Frequency Generator</p>
              <p className="text-gray-400">Binaural beats for healing, meditation, and wellness</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
              <FrequencyControls />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;