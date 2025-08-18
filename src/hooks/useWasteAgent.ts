import { useState, useEffect } from 'react';

interface WasteAgentState {
  snapCount: number;
  lastActiveDate: number;
  shouldShowTraining: boolean;
}

export const useWasteAgent = () => {
  const [agentState, setAgentState] = useState<WasteAgentState>({
    snapCount: 0,
    lastActiveDate: Date.now(),
    shouldShowTraining: true,
  });

  // Load agent state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('waste_agent_state');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      setAgentState(parsed);
    }
  }, []);

  // Save agent state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('waste_agent_state', JSON.stringify(agentState));
  }, [agentState]);

  const recordSnapSuccess = () => {
    setAgentState(prev => ({
      ...prev,
      snapCount: prev.snapCount + 1,
      lastActiveDate: Date.now(),
      shouldShowTraining: prev.snapCount < 2, // Hide after 3rd snap (0, 1, 2)
    }));
  };

  const updateActivity = () => {
    const now = Date.now();
    const daysSinceLastActive = (now - agentState.lastActiveDate) / (1000 * 60 * 60 * 24);
    
    setAgentState(prev => ({
      ...prev,
      lastActiveDate: now,
      shouldShowTraining: prev.snapCount < 3 || daysSinceLastActive >= 7,
    }));
  };

  const shouldShowIdleTraining = (idleTime: number): boolean => {
    // Show training if:
    // 1. User has less than 3 successful snaps, OR
    // 2. User has been away for 7+ days, OR
    // 3. User is idle for considerable time (2+ seconds)
    const daysSinceLastActive = (Date.now() - agentState.lastActiveDate) / (1000 * 60 * 60 * 24);
    
    return (
      agentState.shouldShowTraining && 
      (agentState.snapCount < 3 || daysSinceLastActive >= 7 || idleTime >= 2000)
    );
  };

  return {
    agentState,
    recordSnapSuccess,
    updateActivity,
    shouldShowIdleTraining,
  };
};