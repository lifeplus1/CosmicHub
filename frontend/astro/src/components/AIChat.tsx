import { useState, useEffect, useRef, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../shared/AuthContext";
import { getAuthToken } from "../services/api";

// WebSocket message types
interface WebSocketMessage {
  type: string;
  data: any;
}

interface StreamChunk {
  chunk: string;
  chunk_type: string;
}

// Connection states
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

// Processing states  
type ProcessingState = 'idle' | 'processing' | 'streaming' | 'complete' | 'error';

export default function AIChat() {
  const { user, loading } = useAuth();
  const [message, setMessage] = useState("");
  const [interpretation, setInterpretation] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [isConnecting, setIsConnecting] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Toast notification function
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // In a real app, you'd use a proper toast library
  };

  // WebSocket connection management
  const connectWebSocket = useCallback(async () => {
    if (isConnecting || connectionState === 'connected') return;
    
    setIsConnecting(true);
    setConnectionState('connecting');
    setError(null);
    
    try {
      const token = await getAuthToken();
      const wsUrl = `${import.meta.env.VITE_BACKEND_URL?.replace('http', 'ws')}/api/v1/ai/interpret`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionState('connected');
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;
        showToast("Real-time AI interpretation ready", "success");
      };
      
      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        wsRef.current = null;
        setConnectionState('disconnected');
        setIsConnecting(false);
        
        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connectWebSocket();
          }, delay);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionState('error');
        setError('Connection error occurred');
        setIsConnecting(false);
      };
      
    } catch (err) {
      console.error('Error connecting WebSocket:', err);
      setConnectionState('error');
      setError('Failed to connect to AI service');
      setIsConnecting(false);
    }
  }, [isConnecting, connectionState]);

  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setConnectionState('disconnected');
    sessionIdRef.current = null;
  }, []);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('Received WebSocket message:', message);
    switch (message.type) {
      case 'connected':
        sessionIdRef.current = message.data.session_id;
        console.log('Session established:', sessionIdRef.current);
        break;
        
      case 'processing_start':
        setProcessingState('processing');
        setInterpretation('');
        setError(null);
        break;
        
      case 'stream_chunk':
        setProcessingState('streaming');
        const chunkData: StreamChunk = message.data;
        setInterpretation(prev => prev + chunkData.chunk);
        break;
        
      case 'complete':
        setProcessingState('complete');
        showToast("Your AI interpretation has been generated", "success");
        break;
        
      case 'error':
        setProcessingState('error');
        setError(message.data.error);
        showToast(message.data.error, "error");
        break;
        
      case 'pong':
        // Handle keepalive response
        console.log('Received pong');
        break;
        
      default:
        console.warn('Unknown message type:', message.type);
    }
  }, []);

  const sendInterpretationRequest = useCallback(async () => {
    if (!wsRef.current || connectionState !== 'connected') {
      setError('Not connected to AI service');
      return;
    }
    
    if (!message.trim()) {
      setError('Please enter a message about your chart');
      return;
    }
    
    try {
      const token = await getAuthToken();
      
      // For demo purposes, create mock chart data
      // In a real implementation, this would come from actual chart calculation
      const mockChartData = {
        planets: {
          sun: { position: 120, house: 5 },  // Leo in 5th house
          moon: { position: 240, house: 9 }, // Sagittarius in 9th house
          mercury: { position: 110, house: 4 },
          venus: { position: 100, house: 4 },
          mars: { position: 180, house: 7 }
        },
        houses: [
          { cusp: 90 },   // 1st house Aries
          { cusp: 120 },  // 2nd house Cancer  
          { cusp: 150 },  // 3rd house Leo
          { cusp: 180 },  // 4th house Libra
          { cusp: 210 },  // 5th house Scorpio
          { cusp: 240 },  // 6th house Sagittarius
          { cusp: 270 },  // 7th house Capricorn
          { cusp: 300 },  // 8th house Aquarius
          { cusp: 330 },  // 9th house Pisces
          { cusp: 0 },    // 10th house Aries
          { cusp: 30 },   // 11th house Taurus
          { cusp: 60 }    // 12th house Gemini
        ],
        aspects: []
      };
      
      const interpretationMessage = {
        type: 'interpret',
        data: {
          chart_data: mockChartData,
          interpretation_type: 'advanced',
          user_token: token,
          query: message
        }
      };
      
      console.log('Sending interpretation request:', interpretationMessage);
      wsRef.current.send(JSON.stringify(interpretationMessage));
      setProcessingState('processing');
      
    } catch (err) {
      console.error('Error sending interpretation request:', err);
      setError('Failed to send interpretation request');
    }
  }, [message, connectionState]);

  // Auto-connect on component mount
  useEffect(() => {
    if (user && connectionState === 'disconnected') {
      connectWebSocket();
    }
    
    return () => {
      disconnectWebSocket();
    };
  }, [user, connectWebSocket, disconnectWebSocket, connectionState]);

  // Periodic ping to keep connection alive
  useEffect(() => {
    if (connectionState === 'connected') {
      const pingInterval = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'ping', data: {} }));
        }
      }, 30000); // ping every 30 seconds
      
      return () => clearInterval(pingInterval);
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            AI Astrology Chat
          </h1>
          <span style={{
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: connectionState === 'connected' ? '#10b981' : 
                           connectionState === 'connecting' ? '#f59e0b' :
                           connectionState === 'error' ? '#ef4444' : '#6b7280',
            color: 'white'
          }}>
            {connectionState === 'connected' ? 'Connected' :
             connectionState === 'connecting' ? 'Connecting...' :
             connectionState === 'error' ? 'Error' : 'Disconnected'}
          </span>
        </div>
        
        <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 16px 0' }}>
          Real-time AI interpretation powered by WebSocket streaming
        </p>

        {error && (
          <div style={{
            backgroundColor: 'rgba(185, 28, 28, 0.5)',
            border: '1px solid #ef4444',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ fontWeight: '600', color: '#fecaca' }}>Error!</div>
            <div style={{ color: '#fca5a5' }}>{error}</div>
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#fbbf24', marginBottom: '8px' }}>
            Ask about your astrological chart
          </label>
          <textarea 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            placeholder="What would you like to know about your personality, relationships, or life path?"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              resize: 'vertical',
              minHeight: '80px',
              boxSizing: 'border-box'
            }}
            rows={3}
          />
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <button
            onClick={sendInterpretationRequest}
            disabled={!message.trim() || connectionState !== 'connected' || processingState === 'processing'}
            style={{
              flex: 1,
              backgroundColor: (!message.trim() || connectionState !== 'connected' || processingState === 'processing') 
                ? '#6b7280' : '#8b5cf6',
              color: 'white',
              fontWeight: '600',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: (!message.trim() || connectionState !== 'connected' || processingState === 'processing') 
                ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {processingState === 'processing' && (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid white',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            <span>{processingState === 'processing' ? 'Generating...' : 'Get AI Interpretation'}</span>
          </button>
          
          {connectionState === 'disconnected' && (
            <button
              onClick={connectWebSocket}
              disabled={isConnecting}
              style={{
                backgroundColor: isConnecting ? '#6b7280' : '#3b82f6',
                color: 'white',
                fontWeight: '600',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: isConnecting ? 'not-allowed' : 'pointer'
              }}
            >
              {isConnecting ? 'Connecting...' : 'Reconnect'}
            </button>
          )}
        </div>

        {processingState === 'streaming' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', marginBottom: '16px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #fbbf24',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '14px' }}>Streaming interpretation...</span>
          </div>
        )}

        {interpretation && (
          <div style={{
            marginTop: '24px',
            padding: '24px',
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#fbbf24' }}>
              Your AI Interpretation
            </h3>
            <div style={{
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              color: '#f3f4f6',
              fontSize: '14px'
            }}>
              {interpretation}
            </div>
            {processingState === 'complete' && (
              <div style={{ marginTop: '16px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  fontSize: '12px',
                  borderRadius: '16px'
                }}>
                  Complete
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}