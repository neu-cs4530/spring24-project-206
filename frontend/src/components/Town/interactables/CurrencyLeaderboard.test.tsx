import { render, screen } from '@testing-library/react';
import React from 'react';
import CurrencyLeaderboard from './CurrencyLeaderboard';

describe('CurrencyLeaderboard', () => {
  const playerCurrencyMap = new Map([
    ['Player1', 100],
    ['Player2', 70],
    ['Player3', 90],
    ['Player4', 20],
    ['Player5', 30],
    ['Player6', 80],
    ['Player7', 40],
    ['Player8', 10],
    ['Player9', 30],
    ['Player10', 5],
  ]);
  it('should render a table with the correct headers', () => {
    render(<CurrencyLeaderboard playerCurrencyMap={playerCurrencyMap} />);

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveTextContent('Player');
    expect(headers[1]).toHaveTextContent('Currency Earned');
  });

  it('should render the top 5 players in order of currency earned', () => {
    render(<CurrencyLeaderboard playerCurrencyMap={playerCurrencyMap} />);

    const rows = screen.getAllByRole('row');

    // Check if the top 5 players are rendered
    expect(rows).toHaveLength(6); // 5 players + header row
    expect(rows[1]).toHaveTextContent('Player1');
    expect(rows[2]).toHaveTextContent('Player3');
    expect(rows[3]).toHaveTextContent('Player6');
    expect(rows[4]).toHaveTextContent('Player2');
    expect(rows[5]).toHaveTextContent('Player7');
    expect(rows[6]).toBeUndefined();
  });
});
