import React, { useState, useEffect, useRef } from 'react';

interface WebSocketMessage {
  type: 'realtime_update' | 'alert' | 'error';
  data: Record<string, unknown>;
  timestamp: number;
}

interface AnalyticsWebSocketProps {
  url?: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export const AnalyticsWebSocket: React.FC<AnalyticsWebSocketProps> = ({
  url = `ws://${window.location.host}/ws/analytics`,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  autoReconnect = true,
  reconnectInterval = 5000,
}) => {
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const mountedRef = useRef(true);

  const connect = () => {
    if (!mountedRef.current) return;

    try {
      setConnectionStatus('connecting');
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setConnectionStatus('connected');
        onConnect?.();
        console.log('Analytics WebSocket connected');
      };

      ws.onmessage = event => {
        if (!mountedRef.current) return;
        try {
          const message = JSON.parse(event.data as string) as WebSocketMessage;
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setConnectionStatus('disconnected');
        onDisconnect?.();
        console.log('Analytics WebSocket disconnected');

        if (autoReconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connect();
            }
          }, reconnectInterval);
        }
      };

      ws.onerror = error => {
        if (!mountedRef.current) return;
        setConnectionStatus('error');
        onError?.(error);
        console.error('Analytics WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  useEffect(() => {
    connect();

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [url]);

  // Provide connection status indicator
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-400';
      case 'connecting':
        return 'text-yellow-400';
      case 'disconnected':
        return 'text-gray-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Live';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Offline';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className='flex items-center space-x-2 text-sm'>
      <div
        className={`w-2 h-2 rounded-full ${
          connectionStatus === 'connected'
            ? 'bg-green-400 animate-pulse'
            : connectionStatus === 'connecting'
              ? 'bg-yellow-400 animate-pulse'
              : connectionStatus === 'error'
                ? 'bg-red-400'
                : 'bg-gray-400'
        }`}
      />
      <span className={`font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      {lastMessage && (
        <span className='text-cosmic-silver/60 text-xs'>
          Updated {new Date(lastMessage.timestamp).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

// Hook for using analytics WebSocket
export const useAnalyticsWebSocket = (
  onMessage?: (message: WebSocketMessage) => void,
  options?: Partial<AnalyticsWebSocketProps>
) => {
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  return {
    connectionStatus,
    lastMessage,
    AnalyticsWebSocket: () => (
      <AnalyticsWebSocket
        onMessage={msg => {
          setLastMessage(msg);
          onMessage?.(msg);
        }}
        onConnect={() => setConnectionStatus('connected')}
        onDisconnect={() => setConnectionStatus('disconnected')}
        onError={() => setConnectionStatus('error')}
        {...options}
      />
    ),
  };
};

export default AnalyticsWebSocket;
