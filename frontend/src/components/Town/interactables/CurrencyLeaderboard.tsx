// CurrencyLeaderboard.tsx

import React, { useEffect, useState } from 'react';
import useTownController from '../../../hooks/useTownController';

const CurrencyLeaderboard: React.FC = () => {
  const townController = useTownController();
  const [leaderboard, setLeaderboard] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const updateLeaderboard = (currencyMap: Map<string, number>) => {
      if (!currencyMap) return; // Handle the case where currencyMap is undefined

      // Sort players by currency
      const sortedPlayers = Array.from(currencyMap).sort((a, b) => b[1] - a[1]);

      // Take top 5 players
      const top5Players = sortedPlayers.slice(0, 5);

      // Update leaderboard state
      const leaderboardMap = new Map(top5Players);
      setLeaderboard(leaderboardMap);
    };

    // Subscribe to currency change event
    const currencyChangeListener = (currencyMap: Map<string, number>) => {
      updateLeaderboard(currencyMap);
    };

    townController.on('currencyChanged', currencyChangeListener);

    // Initial update
    updateLeaderboard(townController.getCurrency());

    return () => {
      // Cleanup: Remove event listener
      townController.off('currencyChanged', currencyChangeListener);
    };
  }, [townController]);

  return (
    <div>
      <h2>Currency Leaderboard</h2>
      <ul>
        {Array.from(leaderboard.entries()).map(([playerID, currency]) => (
          <li key={playerID}>
            {playerID}: {currency}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CurrencyLeaderboard;
