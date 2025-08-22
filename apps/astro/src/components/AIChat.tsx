import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@cosmichub/auth";
import { getAuthToken } from "../services/api";
import { useToast } from "./ToastProvider";
import { apiConfig } from '../config/environment';

interface ChatResponse {
  choices: { message: { content: string } }[];
}

interface ErrorResponseData {
  detail: string;
}

interface ErrorResponseWrapper {
  data: ErrorResponseData;
}

interface ErrorResponse {
  response: ErrorResponseWrapper;
}

export default function AIChat(): React.ReactElement {
  const { user, loading } = useAuth();
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (): Promise<void> => {
    setError(null);
    
    if (message === null || message === undefined || typeof message !== 'string' || message.trim().length === 0) {
      return;
    }

    try {
      const token = await getAuthToken();
      
      if (token === null || token === undefined || token.length === 0) {
        throw new Error('Authentication token is missing');
      }

      const res = await axios.post(
        `${apiConfig.baseUrl}/chat`,
        { text: message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

  if (res?.data === null || res?.data === undefined || typeof res?.data !== 'object') {
        throw new Error('No response data received');
      }

      const chatResponse = res.data as ChatResponse;
      
      if (chatResponse === null || chatResponse === undefined || 
          !Array.isArray(chatResponse.choices) || 
          chatResponse.choices.length === 0 ||
          chatResponse.choices[0] === null || 
          chatResponse.choices[0] === undefined ||
          typeof chatResponse.choices[0].message?.content !== 'string' ||
          chatResponse.choices[0].message.content.length === 0) {
        throw new Error('Invalid response format');
      }

      setResponse(chatResponse);
      toast({
        title: "Response Received",
        description: "Your AI response has been generated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      const err = error as Partial<ErrorResponse>;
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

  if (loading === true) {
    return <div className="text-white" role="status" aria-label="Loading authentication">Loading...</div>;
  }
  
  if (user === undefined || user === null || typeof user !== 'object') {
    return <Navigate to="/login" replace aria-label="Redirecting to login" />;
  }

  return (
    <div 
      role="main"
      aria-label="AI Astrology Chat Interface"
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
          disabled={message === null || message === undefined || typeof message !== 'string' || message.trim().length === 0}
          aria-label="Send message to AI chat"
        >
          Send
        </button>
  {error !== null && error !== undefined && typeof error === 'string' && error.length > 0 && (
    <div className="p-3 text-red-400 border rounded-lg bg-red-900/20 border-red-500/30" role="alert">
      {error}
    </div>
  )}
  {response !== null && response !== undefined && 
   typeof response === 'object' &&
   Array.isArray(response.choices) && 
   response.choices.length > 0 && 
   response.choices[0] !== null && 
   response.choices[0] !== undefined &&
   typeof response.choices[0].message?.content === 'string' &&
   response.choices[0].message.content.length > 0 && (
    <div className="p-4 mt-4 border rounded-lg bg-cosmic-purple/20 border-cosmic-purple/30">
      <div className="text-cosmic-silver">{response.choices[0].message.content}</div>
    </div>
  )}
      </div>
    </div>
  );
}