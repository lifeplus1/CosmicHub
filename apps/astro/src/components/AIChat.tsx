import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@cosmichub/auth";
import { getAuthToken } from "../services/api";
import { useToast } from "./ToastProvider";

interface ChatResponse {
  choices: { message: { content: string } }[];
}

interface ErrorResponse {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

export default function AIChat(): React.ReactElement {
  const { user, loading } = useAuth();
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (): Promise<void> => {
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
      setResponse(res.data as ChatResponse);
      toast({
        title: "Response Received",
        description: "Your AI response has been generated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error:", error);
      const err = error as ErrorResponse;
      const errorMessage = err.response?.data?.detail ?? "Failed to get response";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div 
      className="max-w-2xl p-6 mx-auto text-white border shadow-2xl bg-cosmic-dark/80 backdrop-blur-xl border-cosmic-gold/20 rounded-xl"
    >
      <h1 className="mb-6 text-2xl font-bold text-center text-cosmic-gold">
        AI Astrology Chat
      </h1>
      <div className="space-y-4">
        <div>
          <label htmlFor="ai-message-input" className="block mb-2 text-cosmic-gold">Your Message</label>
          <textarea 
            id="ai-message-input"
            value={message} 
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => setMessage(e.target.value)} 
            placeholder="Ask about your chart..." 
            className="w-full p-3 text-white border rounded-lg resize-none bg-cosmic-dark border-cosmic-gold/30 placeholder-cosmic-silver focus:border-cosmic-gold focus:outline-none"
            rows={4}
            aria-describedby="ai-message-help"
          />
          <div id="ai-message-help" className="mt-1 text-sm text-cosmic-silver/70">
            Ask questions about your astrological chart or request interpretations
          </div>
        </div>
        <button
          type="button"
          className="w-full py-3 font-semibold transition-colors rounded-lg bg-cosmic-gold text-cosmic-dark hover:bg-cosmic-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={(): void => {
            void handleSubmit();
          }}
          disabled={!message.trim()}
          aria-label="Send message to AI chat"
        >
          Send
        </button>
        {error && <div className="p-3 text-red-400 border rounded-lg bg-red-900/20 border-red-500/30">{error}</div>}
        {response !== null && (
          <div className="p-4 mt-4 border rounded-lg bg-cosmic-purple/20 border-cosmic-purple/30">
            <div className="text-cosmic-silver">{response.choices[0].message.content}</div>
          </div>
        )}
      </div>
    </div>
  );
}