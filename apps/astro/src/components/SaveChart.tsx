import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from './ToastProvider';
import axios from "axios";
import { useAuth } from "@cosmichub/auth";

export default function SaveChart() {
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
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const token = await user.getIdToken();
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Chart Saved",
        description: "Your natal chart has been saved successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/saved-charts");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to save chart";
      setError(msg);
      toast({
        title: "Error",
        description: msg,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const isFormValid = () => Object.values(formData).every((v) => v);

  return (
    <div className="max-w-2xl p-6 mx-auto cosmic-card">
      <h1 className="mb-6 text-3xl font-bold text-center text-cosmic-gold font-cinzel">Save Natal Chart</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="year" className="block mb-2 text-cosmic-gold">Year *</label>
            <input
              id="year"
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              placeholder="1990"
              className="cosmic-input"
              required
            />
          </div>
          <div>
            <label htmlFor="month" className="block mb-2 text-cosmic-gold">Month *</label>
            <input
              id="month"
              type="number"
              name="month"
              value={formData.month}
              onChange={handleInputChange}
              placeholder="1"
              min="1"
              max="12"
              className="cosmic-input"
              required
            />
          </div>
          <div>
            <label htmlFor="day" className="block mb-2 text-cosmic-gold">Day *</label>
            <input
              id="day"
              type="number"
              name="day"
              value={formData.day}
              onChange={handleInputChange}
              placeholder="1"
              min="1"
              max="31"
              className="cosmic-input"
              required
            />
          </div>
          <div>
            <label htmlFor="hour" className="block mb-2 text-cosmic-gold">Hour (24h) *</label>
            <input
              id="hour"
              type="number"
              name="hour"
              value={formData.hour}
              onChange={handleInputChange}
              placeholder="12"
              min="0"
              max="23"
              className="cosmic-input"
              required
            />
          </div>
          <div>
            <label htmlFor="minute" className="block mb-2 text-cosmic-gold">Minute *</label>
            <input
              id="minute"
              type="number"
              name="minute"
              value={formData.minute}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              max="59"
              className="cosmic-input"
              required
            />
          </div>
          <div>
            <label htmlFor="city" className="block mb-2 text-cosmic-gold">City *</label>
            <input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="New York"
              className="cosmic-input"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="houseSystem" className="block mb-2 text-cosmic-gold">House System *</label>
          <select
            id="houseSystem"
            value={houseSystem}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setHouseSystem(e.target.value)}
            className="cosmic-input"
            required
          >
            <option value="P">Placidus</option>
            <option value="E">Equal House</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full cosmic-button"
          disabled={!isFormValid()}
        >
          Save Chart
        </button>
        {error && <p className="text-center text-red-400">{error}</p>}
      </form>
    </div>
  );
}