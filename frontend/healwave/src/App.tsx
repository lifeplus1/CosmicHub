import FrequencyControls from "./components/FrequencyControls";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import * as RadixTooltip from '@radix-ui/react-tooltip';
import "./styles/App.css";

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-teal-800">
        <Navbar />
        <main className="flex items-center justify-center flex-1 px-4 py-8">
          <div className="w-full max-w-4xl">
            <div className="mb-12 text-center">
              <RadixTooltip.Root>
                <RadixTooltip.Trigger asChild>
                  <h1 className="mb-4 text-5xl font-bold tracking-wide text-white cursor-help">
                    <span className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                      HealWave
                    </span>
                  </h1>
                </RadixTooltip.Trigger>
                <RadixTooltip.Content className="px-3 py-2 text-xs text-white bg-gray-900 rounded shadow-lg">
                  HealWave: Therapeutic Frequency Generator for healing, meditation, and wellness
                  <RadixTooltip.Arrow className="fill-gray-900" />
                </RadixTooltip.Content>
              </RadixTooltip.Root>
              <RadixTooltip.Root>
                <RadixTooltip.Trigger asChild>
                  <p className="mb-2 text-xl text-gray-300 cursor-help">Therapeutic Frequency Generator</p>
                </RadixTooltip.Trigger>
                <RadixTooltip.Content className="px-3 py-2 text-xs text-white bg-gray-900 rounded shadow-lg">
                  This app generates binaural beats for healing, meditation, and wellness.
                  <RadixTooltip.Arrow className="fill-gray-900" />
                </RadixTooltip.Content>
              </RadixTooltip.Root>
              <RadixTooltip.Root>
                <RadixTooltip.Trigger asChild>
                  <p className="text-gray-400 cursor-help">Binaural beats for healing, meditation, and wellness</p>
                </RadixTooltip.Trigger>
                <RadixTooltip.Content className="px-3 py-2 text-xs text-white bg-gray-900 rounded shadow-lg">
                  Learn more about binaural beats and their therapeutic benefits.
                  <RadixTooltip.Arrow className="fill-gray-900" />
                </RadixTooltip.Content>
              </RadixTooltip.Root>
            </div>
            <RadixTooltip.Root>
              <RadixTooltip.Trigger asChild>
                <div className="p-8 border shadow-2xl bg-white/10 backdrop-blur-lg rounded-3xl border-white/20 cursor-help">
                  <FrequencyControls />
                </div>
              </RadixTooltip.Trigger>
              <RadixTooltip.Content className="px-3 py-2 text-xs text-white bg-gray-900 rounded shadow-lg">
                Adjust frequencies and settings for your personalized healing experience.
                <RadixTooltip.Arrow className="fill-gray-900" />
              </RadixTooltip.Content>
            </RadixTooltip.Root>
            </div>
            <RadixTooltip.Root>
              <RadixTooltip.Trigger asChild>
                <div className="p-8 border shadow-2xl bg-white/10 backdrop-blur-lg rounded-3xl border-white/20 cursor-help">
                  <FrequencyControls />
                </div>
              </RadixTooltip.Trigger>
              <RadixTooltip.Content className="px-3 py-2 text-xs text-white bg-gray-900 rounded shadow-lg">
                Adjust frequencies and settings for your personalized healing experience.
                <RadixTooltip.Arrow className="fill-gray-900" />
              </RadixTooltip.Content>
            </RadixTooltip.Root>
          </div>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;