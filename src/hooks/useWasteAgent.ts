import { useState, useEffect } from 'react';
import { databaseService } from '../services/database';

interface WasteAgentState {
  snapCount: number;
  lastActiveDate: number;
  shouldShowTraining: boolean;
}

export const useWasteAgent = (userId: string | null) => {
  const [agentState, setAgentState] = useState<WasteAgentState>({
    snapCount: 0,
    lastActiveDate: Date.now(),
    shouldShowTraining: true,
  });

  useEffect(() => {
    if (!userId) return;

    const loadAgentState = async () => {
      try {
        const logs = await databaseService.getUserActivityLogs(userId, 100);

        const snapSuccessLogs = logs.filter(log => log.activity_type === 'snap_success');
        const lastActivity = logs.length > 0 ? new Date(logs[0].created_at).getTime() : Date.now();

        setAgentState({
          snapCount: snapSuccessLogs.length,
          lastActiveDate: lastActivity,
          shouldShowTraining: snapSuccessLogs.length < 3,
        });
      } catch (error) {
        console.error('Failed to load agent state:', error);
      }
    };

    loadAgentState();
  }, [userId]);

  const recordSnapSuccess = async () => {
    if (!userId) return;

    try {
      await databaseService.logActivity(userId, 'snap_success', {
        timestamp: Date.now(),
      });

      setAgentState(prev => ({
        ...prev,
        snapCount: prev.snapCount + 1,
        lastActiveDate: Date.now(),
        shouldShowTraining: prev.snapCount < 2,
      }));
    } catch (error) {
      console.error('Failed to record snap success:', error);
    }
  };

  const updateActivity = async () => {
    if (!userId) return;

    const now = Date.now();
    const daysSinceLastActive = (now - agentState.lastActiveDate) / (1000 * 60 * 60 * 24);

    try {
      await databaseService.logActivity(userId, 'user_active', {
        timestamp: now,
      });

      setAgentState(prev => ({
        ...prev,
        lastActiveDate: now,
        shouldShowTraining: prev.snapCount < 3 || daysSinceLastActive >= 7,
      }));
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
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