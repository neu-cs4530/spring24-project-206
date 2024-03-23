import React, { useEffect, useState } from 'react';
import { Table, Tbody, Td, Thead, Tr } from '@chakra-ui/react';

interface PlayerCurrency {
  player: string;
  currency: number;
}

interface CurrencyLeaderboardProps {
  playerCurrencyMap: Map<string, number>;
}

const CurrencyLeaderboard: React.FC<CurrencyLeaderboardProps> = ({ playerCurrencyMap }) => {
  const [playerCurrency, setPlayerCurrency] = useState<PlayerCurrency[]>([]);

  useEffect(() => {
    const fetchLeaderboard = () => {
      if (playerCurrencyMap.size === 0) {
        return;
      }

      const playersArray: PlayerCurrency[] = Array.from(playerCurrencyMap).map(
        ([player, currency]) => ({
          player,
          currency,
        }),
      );
      playersArray.sort((a, b) => b.currency - a.currency);
      setPlayerCurrency(playersArray.slice(0, 5));
    };

    fetchLeaderboard();
  }, [playerCurrencyMap]);

  // Listen for changes in player currency map and update leaderboard accordingly
  useEffect(() => {
    const updateLeaderboard = () => {
      const updatedPlayersArray: PlayerCurrency[] = Array.from(playerCurrencyMap).map(
        ([player, currency]) => ({
          player,
          currency,
        }),
      );
      updatedPlayersArray.sort((a, b) => b.currency - a.currency);
      setPlayerCurrency(updatedPlayersArray.slice(0, 5));
    };

    updateLeaderboard();
  }, [playerCurrencyMap]);

  return (
    <Table>
      <Thead>
        <Tr>
          <th>Player</th>
          <th>Currency Earned</th>
        </Tr>
      </Thead>
      <Tbody>
        {playerCurrency.map(({ player, currency }) => (
          <Tr key={player}>
            <Td>{player}</Td>
            <Td>{currency}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default CurrencyLeaderboard;
