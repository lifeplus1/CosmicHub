import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../shared/AuthContext";
import { getAuthToken } from "../services/api";

interface ChatResponse {
  choices: { message: { content: string } }[];
}

export default function AIChat(): JSX.Element {
  const { user, loading } = useAuth();
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (loading) return <div className="text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const handleSubmit = async (): Promise<void> => {
    setError(null);
    setSuccessMessage(null);
    try {
      const token = await getAuthToken();
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/chat`,
        { text: message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResponse(res.data);
      setSuccessMessage("Response Received");
    } catch (error) {
      console.error("Error:", error);
      const err = error as { response?: { data?: { detail?: string } } };
      const errorMessage = err.response?.data?.detail || "Failed to get response";
      setError(errorMessage);
    }
  };

  return (
    <div 
      className="max-w-2xl mx-auto p-4 bg-slate-900/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-lg text-white"
      style={{
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-gold-200">
        AI Astrology Chat
      </h1>
      <div className="space-y-4">
        <div>
          <label className="block text-gold-200 mb-2">Your Message</label>
          <textarea 
            className="w-full p-3 rounded-lg bg-slate-800/50 border border-white/20 text-white placeholder-gray-400 focus:border-gold-300 focus:outline-none"
            value={message} 
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)} 
            placeholder="Ask about your chart..." 
            rows={4}
          />
        </div>
        <button
          className="w-full py-3 px-6 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          onClick={handleSubmit}
          disabled={!message}
        >
          Send
        </button>
        {error && <div className="text-red-300 p-3 bg-red-900/20 rounded-lg">{error}</div>}
        {successMessage && <div className="text-green-300 p-3 bg-green-900/20 rounded-lg">{successMessage}</div>}
        {response && (
          <div className="mt-4 p-4 bg-slate-800/30 rounded-lg">
            <div className="text-gray-100">{response.choices[0].message.content}</div>
          </div>
        )}
      </div>
    </div>
  );
}