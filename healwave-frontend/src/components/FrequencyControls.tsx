import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { savePreset, getPresets } from "../services/api";
import AudioPlayer from "./AudioPlayer";
import DurationTimer from "./DurationTimer";

const PRESETS = {
  solfeggio: [
    { value: "174", label: "174 Hz (Pain Relief & Security)" },
    { value: "285", label: "285 Hz (Tissue Healing)" },
    { value: "396", label: "396 Hz (Liberation from Fear)" },
    { value: "417", label: "417 Hz (Facilitating Change)" },
    { value: "528", label: "528 Hz (Love & DNA Repair)" },
    { value: "639", label: "639 Hz (Heart Connections)" },
    { value: "741", label: "741 Hz (Intuitive Awakening)" },
    { value: "852", label: "852 Hz (Spiritual Order)" },
    { value: "963", label: "963 Hz (Divine Connection)" },
  ],
  rife: [
    // General Health & Immune System
    { value: "20", label: "20 Hz (General Vitality)" },
    { value: "72", label: "72 Hz (Immune System)" },
    { value: "95", label: "95 Hz (Immune Support)" },
    { value: "125", label: "125 Hz (Cellular Regeneration)" },
    { value: "465", label: "465 Hz (Immune Enhancement)" },
    { value: "660", label: "660 Hz (Anti-Inflammatory)" },
    { value: "727", label: "727 Hz (General Healing)" },
    { value: "728", label: "728 Hz (Bone Regeneration)" },
    { value: "787", label: "787 Hz (Cellular Detox)" },
    { value: "800", label: "800 Hz (Nerve Regeneration)" },
    { value: "802", label: "802 Hz (Circulation)" },
    { value: "832", label: "832 Hz (Immune System)" },
    { value: "880", label: "880 Hz (Streptococcus)" },
    { value: "1550", label: "1550 Hz (Eye Health)" },
    { value: "1600", label: "1600 Hz (Parasites)" },
    { value: "2008", label: "2008 Hz (Digestive Support)" },
    { value: "2127", label: "2127 Hz (Lung Health)" },
    { value: "2170", label: "2170 Hz (Eye Strain)" },
    { value: "3000", label: "3000 Hz (Antiviral)" },
    { value: "5000", label: "5000 Hz (General Pathogen)" },
    // Pain & Inflammation
    { value: "304", label: "304 Hz (Arthritis)" },
    { value: "1862", label: "1862 Hz (Joint Pain)" },
    { value: "666", label: "666 Hz (Fibromyalgia)" },
    { value: "1550", label: "1550 Hz (Nerve Pain)" },
    // Specific Conditions
    { value: "120", label: "120 Hz (Sinus Congestion)" },
    { value: "440", label: "440 Hz (Kidney Support)" },
    { value: "465", label: "465 Hz (Throat Health)" },
    { value: "1234", label: "1234 Hz (Digestive Balance)" },
    { value: "10000", label: "10000 Hz (Bone Healing)" },
  ],
  golden: [
    { value: "1.618", label: "1.618 Hz (Golden Ratio)" },
    { value: "89", label: "89 Hz (Fibonacci)" },
    { value: "144", label: "144 Hz (Fibonacci)" },
    { value: "233", label: "233 Hz (Fibonacci)" },
    { value: "377", label: "377 Hz (Fibonacci)" },
    { value: "610", label: "610 Hz (Fibonacci)" },
    { value: "987", label: "987 Hz (Fibonacci)" },
  ],
  planetary: [
    { value: "126.22", label: "126.22 Hz (Sun)" },
    { value: "136.10", label: "136.10 Hz (Earth/OM)" },
    { value: "144.72", label: "144.72 Hz (Mars)" },
    { value: "183.58", label: "183.58 Hz (Jupiter)" },
    { value: "194.18", label: "194.18 Hz (Moon)" },
    { value: "210.42", label: "210.42 Hz (Mercury)" },
    { value: "221.23", label: "221.23 Hz (Venus)" },
    { value: "147.85", label: "147.85 Hz (Saturn)" },
  ],
  brainwave: [
    { value: "40", label: "40 Hz Gamma (Focus)", binaural: "4" },
    { value: "20", label: "20 Hz Beta (Alert)", binaural: "2" },
    { value: "10", label: "10 Hz Alpha (Relaxed)", binaural: "1" },
    { value: "6", label: "6 Hz Theta (Meditation)", binaural: "0.5" },
    { value: "2", label: "2 Hz Delta (Deep Sleep)", binaural: "0.2" },
  ],
  chakra: [
    { value: "194.18", label: "194.18 Hz (Root Chakra)" },
    { value: "210", label: "210 Hz (Sacral Chakra)" },
    { value: "126.22", label: "126.22 Hz (Solar Plexus)" },
    { value: "136.10", label: "136.10 Hz (Heart Chakra)" },
    { value: "141.27", label: "141.27 Hz (Throat Chakra)" },
    { value: "221.23", label: "221.23 Hz (Third Eye)" },
    { value: "172.06", label: "172.06 Hz (Crown Chakra)" },
  ],
  other: [
    { value: "111", label: "111 Hz (Cellular Rejuvenation)" },
    { value: "432", label: "432 Hz (Natural Tuning)" },
    { value: "528", label: "528 Hz (Love Frequency)" },
    { value: "7.83", label: "7.83 Hz (Schumann Resonance)" },
    { value: "40", label: "40 Hz (Neuroplasticity)" },
  ]
};

const FrequencyControls = () => {
  // Core state
  const [frequency, setFrequency] = useState(440);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [binaural, setBinaural] = useState(0);
  const [duration, setDuration] = useState(10); // minutes
  
  // UI state
  const [category, setCategory] = useState("custom");
  const [preset, setPreset] = useState("custom");
  const [showHelp, setShowHelp] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [presetName, setPresetName] = useState("");
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadSavedPresets();
    }
  }, [user]);

  const loadSavedPresets = async () => {
    try {
      await getPresets();
    } catch (error) {
      console.error("Failed to load presets:", error);
    }
  };

  const getCategoryDescription = (cat: string) => {
    const descriptions: { [key: string]: string } = {
      solfeggio: "Ancient sacred frequencies used for spiritual healing and transformation.",
      rife: "Frequencies developed by Royal Rife for cellular healing and pathogen elimination.",
      golden: "Mathematical frequencies based on the golden ratio and Fibonacci sequence.",
      planetary: "Frequencies derived from planetary orbital periods, used in sound healing.",
      brainwave: "Binaural beats designed to entrain specific brainwave states for meditation and focus.",
      chakra: "Frequencies that resonate with the seven main chakras for energy balancing.",
      other: "Various healing frequencies from different traditions and research studies."
    };
    return descriptions[cat] || "";
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPreset(value);
    if (value !== "custom") {
      const selectedPreset = Object.values(PRESETS).flat().find((p: any) => p.value === value);
      if (selectedPreset) {
        setFrequency(parseFloat(selectedPreset.value));
        setBinaural((selectedPreset as any).binaural ? parseFloat((selectedPreset as any).binaural) : 0);
      }
    }
  };

  const handleSavePreset = async () => {
    if (!user || !presetName.trim()) return;
    
    try {
      await savePreset({
        name: presetName,
        frequency,
        binaural_offset: binaural,
        waveform: 'sine'
      });
      setPresetName("");
      setShowPresets(false);
      await loadSavedPresets();
    } catch (error) {
      console.error("Failed to save preset:", error);
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSessionComplete = () => {
    setIsPlaying(false);
  };

  const getPresetsForCategory = () => {
    if (category === "custom") return [];
    return (PRESETS as any)[category] || [];
  };

  return (
    <div className="space-y-8">
      {/* Help Section */}
      <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30 shadow-lg">
        <button 
          onClick={() => setShowHelp(!showHelp)}
          className="w-full flex items-center justify-between text-white p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20 hover:border-blue-400/50"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-lg">📚</span>
            </div>
            <div className="text-left">
              <span className="font-semibold text-lg block">Frequency Guide & Research</span>
              <span className="text-sm text-blue-200">Learn about healing frequencies</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-blue-200 hidden sm:block">
              {showHelp ? 'Hide Guide' : 'Show Guide'}
            </span>
            <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">{showHelp ? '−' : '+'}</span>
            </div>
          </div>
        </button>
        
        {showHelp && (
          <div className="mt-6 space-y-4 text-sm text-white/90">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-cyan-400/20">
                <h4 className="font-semibold text-cyan-300 flex items-center">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
                  🎵 Solfeggio Frequencies
                </h4>
                <p className="text-xs text-white/80 leading-relaxed">Ancient sacred tones used in Gregorian chants, believed to promote spiritual and physical healing through vibrational resonance.</p>
              </div>
              
              <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-green-400/20">
                <h4 className="font-semibold text-green-300 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  ⚡ Rife Frequencies
                </h4>
                <p className="text-xs text-white/80 leading-relaxed">Developed by Royal Rife in the 1930s, these frequencies target specific health conditions through cellular resonance and pathogen elimination.</p>
              </div>
              
              <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-yellow-400/20">
                <h4 className="font-semibold text-yellow-300 flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                  🌍 Planetary Frequencies
                </h4>
                <p className="text-xs text-white/80 leading-relaxed">Based on the mathematical relationship between planetary orbital periods, these frequencies connect us to cosmic rhythms and natural cycles.</p>
              </div>
              
              <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-purple-400/20">
                <h4 className="font-semibold text-purple-300 flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  🧠 Brainwave Entrainment
                </h4>
                <p className="text-xs text-white/80 leading-relaxed">Binaural beats that guide your brain into specific states: Delta (deep sleep), Theta (meditation), Alpha (relaxation), Beta (focus), Gamma (awareness).</p>
              </div>
            </div>
            
            <div className="text-xs text-white/70 mt-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-400/20">
              <div className="flex items-start space-x-2">
                <span className="text-amber-400 mt-1">⚠️</span>
                <div>
                  <strong className="text-amber-300">Important Disclaimer:</strong> These frequencies are for research, wellness, and meditation purposes only. While many users report positive effects, these tools are not intended to diagnose, treat, cure, or prevent any medical condition. Always consult qualified healthcare professionals for medical concerns.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category and Preset Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/90">Frequency Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
          >
            <option value="custom">Custom Frequency</option>
            <option value="solfeggio">Solfeggio Frequencies</option>
            <option value="rife">Rife Healing Frequencies</option>
            <option value="golden">Golden Ratio & Fibonacci</option>
            <option value="planetary">Planetary Frequencies</option>
            <option value="brainwave">Brainwave Entrainment</option>
            <option value="chakra">Chakra Frequencies</option>
            <option value="other">Other Healing Tones</option>
          </select>
          {category !== "custom" && (
            <div className="text-xs text-white/70 mt-2 p-2 bg-white/5 rounded-lg">
              {getCategoryDescription(category)}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/90">Preset Selection</label>
          <select
            value={preset}
            onChange={handlePresetChange}
            className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
          >
            <option value="custom">Custom Settings</option>
            {getPresetsForCategory().map((p: any) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Frequency Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/90">
            Frequency (Hz)
          </label>
          <input
            type="number"
            min="0.1"
            max="20000"
            step="0.1"
            value={frequency}
            onChange={(e) => setFrequency(parseFloat(e.target.value) || 0)}
            className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/90">
            Volume ({Math.round(volume * 100)}%)
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/90">
            Binaural Beat (Hz)
          </label>
          <input
            type="number"
            min="0"
            max="40"
            step="0.1"
            value={binaural}
            onChange={(e) => setBinaural(parseFloat(e.target.value) || 0)}
            className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Duration and Timer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/90">
            Session Duration (minutes)
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
          >
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 hour</option>
          </select>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4 border border-white/20">
          <DurationTimer
            duration={duration}
            isActive={isPlaying}
            onComplete={handleSessionComplete}
          />
        </div>
      </div>

      {/* Audio Controls */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={togglePlayback}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-2 ${
              isPlaying
                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-red-500/25'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-green-500/25'
            }`}
          >
            <span className="text-2xl">{isPlaying ? '⏸️' : '▶️'}</span>
            <span>{isPlaying ? 'Stop' : 'Start'} Session</span>
          </button>
        </div>
        
        <div className="text-center text-white/70 text-sm">
          <p>Current: {frequency}Hz {binaural > 0 && `+ ${binaural}Hz binaural beat`}</p>
          <p>{duration} minute session • Volume: {Math.round(volume * 100)}%</p>
        </div>
      </div>

      {/* Save Preset Section */}
      {user && (
        <div className="bg-white/5 rounded-xl p-6 border border-white/20">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="w-full flex items-center justify-between text-white p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200"
          >
            <span className="font-semibold">Save Custom Preset</span>
            <span className="text-xl">{showPresets ? '−' : '+'}</span>
          </button>
          
          {showPresets && (
            <div className="mt-4 space-y-4">
              <input
                type="text"
                placeholder="Enter preset name..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              />
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                Save Preset
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden AudioPlayer Component */}
      <div className="hidden">
        <AudioPlayer
          frequency={frequency}
          volume={volume}
          isPlaying={isPlaying}
          binauralBeat={binaural}
          onPlayStateChange={setIsPlaying}
        />
      </div>
    </div>
  );
};

export default FrequencyControls;