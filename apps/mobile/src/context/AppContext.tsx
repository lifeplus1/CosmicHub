import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface User {
  id: string;
  // Add other user properties as needed
}

interface Chart {
  id: string;
  name: string;
  data: Record<string, unknown>;
}

interface Frequency {
  id: string;
  value: number;
  name: string;
}

interface AppState {
  user: User | undefined;
  charts: Chart[];
  frequencies: Frequency[];
  loading: boolean;
  error: string | undefined;
}

type AppAction = 
  | { type: 'SET_USER'; payload: User | undefined }
  | { type: 'SET_CHARTS'; payload: Chart[] }
  | { type: 'ADD_CHART'; payload: Chart }
  | { type: 'SET_FREQUENCIES'; payload: Frequency[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined };

const initialState: AppState = {
  user: undefined,
  charts: [],
  frequencies: [],
  loading: false,
  error: undefined,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_CHARTS':
      return { ...state, charts: action.payload };
    case 'ADD_CHART':
      return { ...state, charts: [...state.charts, action.payload] };
    case 'SET_FREQUENCIES':
      return { ...state, frequencies: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    setUser: (user: User | undefined) => void;
    addChart: (chart: Chart) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | undefined) => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = {
    setUser: (user: User | undefined) => dispatch({ type: 'SET_USER', payload: user }),
    addChart: (chart: Chart) => dispatch({ type: 'ADD_CHART', payload: chart }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | undefined) => dispatch({ type: 'SET_ERROR', payload: error }),
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Convenience hooks for specific parts of state
export function useAuth() {
  const { state } = useApp();
  return state.user;
}

export function useCharts() {
  const { state } = useApp();
  return state.charts;
}

export function useLoading() {
  const { state } = useApp();
  return state.loading;
}
