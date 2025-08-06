import FrequencyControls from "./components/FrequencyControls";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import "./styles/App.css";

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-teal-800">
        <Navbar />
        <main className="flex items-center justify-center flex-1 px-4 py-8">
          <div className="w-full max-w-4xl">
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-5xl font-bold tracking-wide text-white">
                <span className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                  HealWave
                </span>
              </h1>
              <p className="mb-2 text-xl text-gray-300">Therapeutic Frequency Generator</p>
              <p className="text-gray-400">Binaural beats for healing, meditation, and wellness</p>
            </div>
            <div className="p-8 border shadow-2xl bg-white/10 backdrop-blur-lg rounded-3xl border-white/20">
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