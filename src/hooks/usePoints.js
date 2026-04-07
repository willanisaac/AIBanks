import { useState, useEffect, useCallback } from 'react';
import { USER_PROFILE, UPCOMING_MATCHES } from '../data/mockData';
import { useWorldCupMatches } from './useWorldCupMatches';

export function usePoints() {
  const { matches } = useWorldCupMatches();
  const allMatches = matches?.length ? matches : UPCOMING_MATCHES;

  const [predictions, setPredictionsState] = useState(() => {
    try {
      const stored = window.localStorage.getItem('predictions');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [redeemedRewards, setRedeemedRewards] = useState(() => {
    try {
      const stored = window.localStorage.getItem('redeemedRewards');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Calcular puntos ganados
  const earnedPredictionPoints = Object.entries(predictions).reduce((acc, [matchId]) => {
    const match = allMatches.find((m) => String(m.id) === String(matchId));
    return acc + (match ? (match.points || 0) : 0);
  }, 0);

  // Calcular puntos gastados
  const spentPoints = Object.values(redeemedRewards).reduce((acc, reward) => {
    return acc + (reward.cost || 0);
  }, 0);

  // Puntos netos
  const currentPoints = USER_PROFILE.points + earnedPredictionPoints - spentPoints;

  const redeemReward = useCallback((reward) => {
    if (currentPoints >= reward.cost && !redeemedRewards[reward.id]) {
      const newRedeemed = { ...redeemedRewards, [reward.id]: reward };
      setRedeemedRewards(newRedeemed);
      window.localStorage.setItem('redeemedRewards', JSON.stringify(newRedeemed));
      window.dispatchEvent(new Event('local-storage'));
    }
  }, [currentPoints, redeemedRewards]);

  const setPredictions = useCallback((newPredsInput) => {
    setPredictionsState((prev) => {
      const next = typeof newPredsInput === 'function' ? newPredsInput(prev) : newPredsInput;
      window.localStorage.setItem('predictions', JSON.stringify(next));
      window.dispatchEvent(new Event('local-storage'));
      return next;
    });
  }, []);

  // Escuchar eventos en la misma pestaña y entre pestañas
  useEffect(() => {
    const handleStorage = () => {
      try {
        const storedRedeemed = window.localStorage.getItem('redeemedRewards');
        if (storedRedeemed) setRedeemedRewards(JSON.parse(storedRedeemed));
        
        const storedPreds = window.localStorage.getItem('predictions');
        if (storedPreds) setPredictionsState(JSON.parse(storedPreds));
      } catch {}
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('local-storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('local-storage', handleStorage);
    };
  }, []);

  return {
    currentPoints,
    earnedPredictionPoints,
    spentPoints,
    redeemedRewards,
    redeemReward,
    predictions,
    setPredictions
  };
}
