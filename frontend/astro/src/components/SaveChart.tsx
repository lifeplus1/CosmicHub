import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import { cn, buttonVariants } from "../shared/utils";

export default function SaveChart(): JSX.Element {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    year: "",
    month: "",
    day: "",
    hour: "",
    minute: "",
    city: "",
  });
  const [houseSystem, setHouseSystem] = useState("P");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return <></>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    try {
      // For now, just use user token directly - this will need to be updated when we implement proper auth
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/save-chart`,
        {
          year: parseInt(formData.year),
          month: parseInt(formData.month),
          day: parseInt(formData.day),
          hour: parseInt(formData.hour),
          minute: parseInt(formData.minute),
          city: formData.city,
          house_system: houseSystem
        },
        { headers: { Authorization: `Bearer ${user.uid}` } }
      );
      toast({ title: "Chart Saved", status: "success", duration: 3000 });
      navigate("/saved-charts");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to save chart";
      setError(msg);
      toast({ title: "Error", description: msg, status: "error", duration: 5000 });
    }
  };

  const isFormValid = (): boolean => Object.values(formData).every((v) => v);

  return (
    <div className="max-w-2xl mx-auto p-4 bg-slate-900/80 border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.3)] rounded-lg text-white">
      <h1 className="mb-6 text-center text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
        Save Natal Chart
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-yellow-200 mb-1">Year *</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              placeholder="1990"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-yellow-200 mb-1">Month *</label>
            <input
              type="number"
              name="month"
              value={formData.month}
              onChange={handleInputChange}
              placeholder="1"
              min="1"
              max="12"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-yellow-200 mb-1">Day *</label>
            <input
              type="number"
              name="day"
              value={formData.day}
              onChange={handleInputChange}
              placeholder="1"
              min="1"
              max="31"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-yellow-200 mb-1">Hour (24h) *</label>
            <input
              type="number"
              name="hour"
              value={formData.hour}
              onChange={handleInputChange}
              placeholder="12"
              min="0"
              max="23"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-yellow-200 mb-1">Minute *</label>
            <input
              type="number"
              name="minute"
              value={formData.minute}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              max="59"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-yellow-200 mb-1">City *</label>
            <input
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="New York"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-yellow-200 mb-1">House System *</label>
            <select
              value={houseSystem}
              onChange={(e) => setHouseSystem(e.target.value)}
              title="Select house system"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
            >
              <option value="P">Placidus</option>
              <option value="E">Equal House</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={!isFormValid()}
            className={cn(
              buttonVariants({ variant: 'default', size: 'default' }),
              "w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            Save Chart
          </button>
          {error && <p className="text-red-300 text-sm mt-2">{error}</p>}
        </div>
      </form>
    </div>
  );
}