import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@cosmichub/auth";
import { getAuthToken } from "../services/api";
import { useToast } from "./ToastProvider";

interface ChatResponse {
  choices: { message: { content: string } }[];
}

export default function AIChat() {
  const { user, loading } = useAuth();
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  if (loading) return <div className="text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const handleSubmit = async () => {
    setError(null);
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
      toast({
        title: "Response Received",
        description: "Your AI response has been generated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error:", error);
      const err = error as any;
      setError(err.response?.data?.detail || "Failed to get response");
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to get response",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <div 
      className="max-w-2xl p-6 mx-auto text-white border shadow-2xl bg-cosmic-dark/80 backdrop-blur-xl border-cosmic-gold/20 rounded-xl"
    >
      <h1 className="mb-6 text-2xl font-bold text-center text-cosmic-gold">
        AI Astrology Chat
      </h1>
      <div className="space-y-4">
        <div>
          <label className="block mb-2 text-cosmic-gold">Your Message</label>
          <textarea 
            value={message} 
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)} 
            placeholder="Ask about your chart..." 
            className="w-full p-3 text-white border rounded-lg resize-none bg-cosmic-dark border-cosmic-gold/30 placeholder-cosmic-silver focus:border-cosmic-gold focus:outline-none"
            rows={4}
          />
        </div>
        <button
          className="w-full py-3 font-semibold transition-colors rounded-lg bg-cosmic-gold text-cosmic-dark hover:bg-cosmic-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={!message}
        >
          Send
        </button>
        {error && <div className="p-3 text-red-400 border rounded-lg bg-red-900/20 border-red-500/30">{error}</div>}
        {response && (
          <div className="p-4 mt-4 border rounded-lg bg-cosmic-purple/20 border-cosmic-purple/30">
            <div className="text-cosmic-silver">{response.choices[0].message.content}</div>
          </div>
        )}
      </div>
    </div>
  );
}