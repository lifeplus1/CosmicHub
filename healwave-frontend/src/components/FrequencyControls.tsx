import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { savePreset, getPresets } from "../services/api";

const PRESETS = {
  solfeggio: [
    { value: "174", label: "174 Hz (Pain Relief)" },
    { value: "285", label: "285 Hz (Healing)" },
    { value: "396", label: "396 Hz (Liberation)" },
    { value: "417", label: "417 Hz (Change)" },
    { value: "528", label: "528 Hz (Transformation)" },
    { value: "639", label: "639 Hz (Connection)" },
    { value: "741", label: "741 Hz (Expression)" },
    { value: "852", label: "852 Hz (Intuition)" },
    { value: "963", label: "963 Hz (Divinity)" },
  ],
  rife: [
    { value: "727", label: "727 Hz (General Healing)" },
    { value: "800", label: "800 Hz (Cure All)" },
    { value: "880", label: "880 Hz (Pain Relief)" },
  ],
  golden: [
    { value: "89", label: "89 Hz (Fibonacci)" },
    { value: "1.618", label: "Phi Beat (1.618 Hz Binaural)", binaural: true },
  ],
  other: [
    { value: "432", label: "432 Hz (Natural Tuning)" },
    { value: "7.83", label: "7.83 Hz (Schumann Resonance)" },
  ],
};

function FrequencyControls() {
  const { user } = useContext(AuthContext);
  const [category, setCategory] = useState("custom");
  const [preset, setPreset] = useState("custom");
  const [frequency, setFrequency] = useState(440);
  const [binaural, setBinaural] = useState(0);
  const [waveform, setWaveform] = useState("sine");
  const [volume, setVolume] = useState(0.5);
  const [duration, setDuration] = useState(0);
  const [presetName, setPresetName] = useState("");
  const [savedPresets, setSavedPresets] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  let audioContext, oscillatorLeft, oscillatorRight, gainNode, pannerLeft, pannerRight;

  useEffect(() => {
    if (user) {
      getPresets().then(setSavedPresets).catch(console.error);
    }
  }, [user]);

  const handlePresetChange = (e) => {
    const value = e.target.value;
    setPreset(value);
    if (value !== "custom") {
      const selectedPreset = Object.values(PRESETS).flat().find((p) => p.value === value);
      setFrequency(parseFloat(selectedPreset.value));
      setBinaural(selectedPreset.binaural ? parseFloat(selectedPreset.value) : 0);
    }
  };

  const startAudio = async () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === "suspended") await audioContext.resume();
    }

    stopAudio();

    oscillatorLeft = audioContext.createOscillator();
    oscillatorLeft.type = waveform;
    oscillatorLeft.frequency.setValueAtTime(frequency, audioContext.currentTime);

    oscillatorRight = audioContext.createOscillator();
    oscillatorRight.type = waveform;
    oscillatorRight.frequency.setValueAtTime(frequency + binaural, audioContext.currentTime);

    pannerLeft = audioContext.createStereoPanner();
    pannerLeft.pan.setValueAtTime(-1, audioContext.currentTime);
    pannerRight = audioContext.createStereoPanner();
    pannerRight.pan.setValueAtTime(1, audioContext.currentTime);

    gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

    oscillatorLeft.connect(pannerLeft).connect(gainNode);
    oscillatorRight.connect(pannerRight).connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillatorLeft.start();
    oscillatorRight.start();

    setIsPlaying(true);

    if (duration > 0) {
      setTimeout(stopAudio, duration * 60 * 1000);
    }
  };

  const stopAudio = () => {
    if (oscillatorLeft && oscillatorRight) {
      oscillatorLeft.stop();
      oscillatorRight.stop();
      oscillatorLeft.disconnect();
      oscillatorRight.disconnect();
      setIsPlaying(false);
    }
  };

  const saveUserPreset = async () => {
    if (!user || !presetName) return;
    try {
      await savePreset({ frequency, binaural_offset: binaural, waveform, name: presetName });
      const updatedPresets = await getPresets();
      setSavedPresets(updatedPresets);
      setPresetName("");
    } catch (error) {
      console.error("Failed to save preset:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="space-y-4">
        <div>
          <label className="block font-semibold text-teal-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="custom">Custom</option>
            <option value="solfeggio">Solfeggio</option>
            <option value="rife">Rife</option>
            <option value="golden">Golden Ratio</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-teal-700">Preset</label>
          <select value={preset} onChange={handlePresetChange} className="w-full p-2 border rounded">
            <option value="custom">Custom</option>
            {category !== "custom" &&
              PRESETS[category].map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            {savedPresets.map((p) => (
              <option key={p.id} value={p.frequency}>
                {p.name} ({p.frequency} Hz)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold text-teal-700">Frequency (Hz)</label>
          <input
            type="number"
            value={frequency}
            onChange={(e) => setFrequency(parseFloat(e.target.value))}
            min="1"
            max="22000"
            step="0.1"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-semibold text-teal-700">Binaural Offset (Hz)</label>
          <input
            type="number"
            value={binaural}
            onChange={(e) => setBinaural(parseFloat(e.target.value))}
            min="0"
            max="40"
            step="0.1"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block font-semibold text-teal-700">Waveform</label>
          <select
            value={waveform}
            onChange={(e) => setWaveform(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="sine">Sine</option>
            <option value="square">Square</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="triangle">Triangle</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-teal-700">Volume</label>
          <input
            type="range"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            min="0"
            max="1"
            step="0.01"
            className="w-full"
          />
          <span>{Math.round(volume * 100)}%</span>
        </div>
        <div>
          <label className="block font-semibold text-teal-700">Duration (minutes, 0 for infinite)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            min="0"
            step="1"
            className="w-full p-2 border rounded"
          />
        </div>
        {user && (
          <div>
            <label className="block font-semibold text-teal-700">Save Preset As</label>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Preset name"
              className="w-full p-2 border rounded mb-2"
            />
            <button
              onClick={saveUserPreset}
              disabled={!presetName}
              className="w-full bg-teal-600 text-white p-2 rounded hover:bg-teal-700 disabled:bg-gray-400"
            >
              Save Preset
            </button>
          </div>
        )}
        <div className="flex space-x-4">
          <button
            onClick={startAudio}
            className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700"
            disabled={isPlaying}
          >
            Play
          </button>
          <button
            onClick={stopAudio}
            className="flex-1 bg-red-600 text-white p-2 rounded hover:bg-red-700"
            disabled={!isPlaying}
          >
            Stop
          </button>
        </div>
        {!user && (
          <div className="text-center bg-yellow-100 p-4 rounded">
            <p>
              <a href="/login" className="text-teal-600 font-bold">
                Log in
              </a>{" "}
              to save presets and unlock premium features!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FrequencyControls;