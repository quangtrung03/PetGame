import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { getUserEconomicStats } from '../api/games';
import { useAuth } from './AuthContext';

const EconomicContext = createContext();

const initialState = {
  coins: 0,
  level: 1,
  dailyLoginStreak: 0,
  dailyStats: {
    coinsEarned: 0,
    coinsSpent: 0,
    lastReset: new Date()
  },
  purchaseHistory: {
    food: 0,
    toys: 0,
    total: 0
  },
  cooldowns: {},
  isLoading: false,
  error: null,
  lastUpdated: null
};

const economicReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case 'UPDATE_COINS':
      return {
        ...state,
        coins: action.payload.coins,
        dailyStats: {
          ...state.dailyStats,
          coinsEarned: state.dailyStats.coinsEarned + (action.payload.earned || 0),
          coinsSpent: state.dailyStats.coinsSpent + (action.payload.spent || 0)
        }
      };
    case 'UPDATE_COOLDOWNS':
      return {
        ...state,
        cooldowns: action.payload
      };
    case 'UPDATE_PURCHASE_HISTORY':
      return {
        ...state,
        purchaseHistory: {
          ...state.purchaseHistory,
          ...action.payload
        }
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

export const EconomicProvider = ({ children }) => {
  const [state, dispatch] = useReducer(economicReducer, initialState);
  const { isAuthenticated } = useAuth();
  const fetchTimeoutRef = useRef(null);
  const isFirstRender = useRef(true);

  const fetchEconomicData = useCallback(async (showLoading = true) => {
    if (!isAuthenticated) return;
    
    // Clear previous pending request
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Debounce for auto-refresh, immediate for user actions
    const delay = showLoading ? 0 : 300;
    
    fetchTimeoutRef.current = setTimeout(async () => {
      try {
        if (showLoading) {
          dispatch({ type: 'FETCH_START' });
        }
        
        const response = await getUserEconomicStats();
        // Backend trả về { success, message, data }
        dispatch({ 
          type: 'FETCH_SUCCESS', 
          payload: response.data.data || response.data
        });
      } catch (error) {
        console.error('Error fetching economic data:', error);
        dispatch({ 
          type: 'FETCH_ERROR', 
          payload: error.message 
        });
      }
    }, delay);
  }, [isAuthenticated]);

  const updateCoins = (newCoins, earned = 0, spent = 0) => {
    dispatch({
      type: 'UPDATE_COINS',
      payload: { coins: newCoins, earned, spent }
    });
  };

  const updateCooldowns = (newCooldowns) => {
    dispatch({
      type: 'UPDATE_COOLDOWNS',
      payload: newCooldowns
    });
  };

  const updatePurchaseHistory = (updates) => {
    dispatch({
      type: 'UPDATE_PURCHASE_HISTORY',
      payload: updates
    });
  };

  const refreshData = () => {
    fetchEconomicData(false);
  };

  // Auto refresh data every 30 seconds with cleanup protection
  useEffect(() => {
    let interval;
    
    if (isAuthenticated) {
      // Initial fetch only on first render or auth change
      if (isFirstRender.current) {
        fetchEconomicData();
        isFirstRender.current = false;
      }
      
      // Setup auto-refresh interval
      interval = setInterval(() => {
        fetchEconomicData(false);
      }, 30000);
    } else {
      dispatch({ type: 'RESET' });
      isFirstRender.current = true;
    }
    
    // Cleanup function
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [isAuthenticated, fetchEconomicData]);

  const value = {
    ...state,
    fetchEconomicData,
    updateCoins,
    updateCooldowns,
    updatePurchaseHistory,
    refreshData
  };

  return (
    <EconomicContext.Provider value={value}>
      {children}
    </EconomicContext.Provider>
  );
};

export const useEconomic = () => {
  const context = useContext(EconomicContext);
  if (!context) {
    throw new Error('useEconomic must be used within an EconomicProvider');
  }
  return context;
};
