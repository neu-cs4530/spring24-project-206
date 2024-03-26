import { Heading } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import useTownController from '../../../hooks/useTownController';
import { CurrencyMap } from '../../../types/CoveyTownSocket';

// Define a functional component for displaying currency leaderboards
const CurrencyLeaderboard: React.FC = () => {
  // Access town controller using a custom hook
  const townController = useTownController();

  // State variables to store the leaderboard data
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<CurrencyMap>(new Map());
  const [currentLeaderboard, setCurrentLeaderboard] = useState<CurrencyMap>(new Map());

  // Effect hook to run once on component mount and on changes to town controller
  useEffect(() => {
    // Function to update the all-time leaderboard
    const updateAllTimeLeaderboard = (currencyMap: CurrencyMap) => {
      if (!currencyMap) return;
      // Sort players by currency amount and extract the top 5
      const sortedPlayers = Array.from(currencyMap).sort((a, b) => b[1] - a[1]);
      const top5Players = sortedPlayers.slice(0, 5);
      // Convert the top 5 players into a Map and update state
      const leaderboardMap = new Map(top5Players);
      setAllTimeLeaderboard(leaderboardMap);
    };

    // Function to update the current leaderboard
    const updateCurrentLeaderboard = (currencyMap: CurrencyMap) => {
      if (!currencyMap) return;
      // Sort players by currency amount and extract the top 5
      const sortedPlayers = Array.from(currencyMap).sort((a, b) => b[1] - a[1]);
      const top5Players = sortedPlayers.slice(0, 5);
      // Convert the top 5 players into a Map and update state
      const leaderboardMap = new Map(top5Players);
      setCurrentLeaderboard(leaderboardMap);
    };

    // Event listeners to update leaderboards when currency changes
    const currencyChangeListener = (currencyMap: CurrencyMap) => {
      updateAllTimeLeaderboard(currencyMap);
    };
    const currentCurrencyChangeListener = (currencyMap: CurrencyMap) => {
      updateCurrentLeaderboard(currencyMap);
    };

    // Attach event listeners to town controller
    townController.on('allTimeCurrencyChanged', currencyChangeListener);
    townController.on('currentCurrencyChanged', currentCurrencyChangeListener);

    // Initialize leaderboards with initial currency data
    updateAllTimeLeaderboard(townController.getAllTimeCurrency());
    updateCurrentLeaderboard(townController.getCurrentCurrency());

    // Detach event listeners on component unmount
    return () => {
      townController.off('allTimeCurrencyChanged', currencyChangeListener);
      townController.off('currentCurrencyChanged', currentCurrencyChangeListener);
    };
    // Dependency array to trigger effect on town controller changes
  }, [townController]);

  // JSX to render the component
  return (
    <div>
      {/* Heading for all-time currency leaderboard */}
      <Heading fontSize='xl' as='h1'>
        All-Time Currency Leaderboard
      </Heading>
      {/* List of players and their currency in the all-time leaderboard */}
      <ul>
        {Array.from(allTimeLeaderboard.entries()).map(([playerID, currency]) => (
          <li key={playerID}>
            {playerID}: {currency}
          </li>
        ))}
      </ul>
      {/* Divider */}
      <hr style={{ margin: '20px 0' }} />
      {/* Heading for current currency leaderboard */}
      <Heading fontSize='xl' as='h1'>
        Current Currency Leaderboard
      </Heading>
      {/* List of players and their currency in the current leaderboard */}
      <ul>
        {Array.from(currentLeaderboard.entries()).map(([playerID, currency]) => (
          <li key={playerID}>
            {playerID}: {currency}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Export the component as default
export default CurrencyLeaderboard;
