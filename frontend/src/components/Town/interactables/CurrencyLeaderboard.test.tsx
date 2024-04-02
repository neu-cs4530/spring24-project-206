import React from 'react';
import { render } from '@testing-library/react';
import CurrencyLeaderboard from './CurrencyLeaderboard';
import useTownController from '../../../hooks/useTownController';
import TownController from '../../../classes/TownController';

// Mock the useTownController hook
jest.mock('../../../hooks/useTownController');

describe('CurrencyLeaderboard Component', () => {
  const mockTownController: Partial<TownController> = {
    getAllTimeCurrency: jest.fn(),
    getCurrentCurrency: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  };
  beforeEach(() => {
    // Mock the necessary functions/properties of the mocked useTownController
    const mockUseTownController = useTownController as jest.MockedFunction<
      typeof useTownController
    >;
    mockUseTownController.mockReturnValue(mockTownController as TownController);
  });

  test('renders all-time currency leaderboard properly', () => {
    const { getByText } = render(<CurrencyLeaderboard />);
    expect(getByText('All-Time Currency Leaderboard')).toBeInTheDocument();
  });

  test('renders current currency leaderboard properly', () => {
    const { getByText } = render(<CurrencyLeaderboard />);
    expect(getByText('Current Currency Leaderboard')).toBeInTheDocument();
  });

  test('calls getAllTimeCurrency when component mounts', () => {
    render(<CurrencyLeaderboard />);
    expect(mockTownController.getAllTimeCurrency).toHaveBeenCalled();
  });

  test('calls getCurrentCurrency when component mounts', () => {
    render(<CurrencyLeaderboard />);
    expect(mockTownController.getCurrentCurrency).toHaveBeenCalled();
  });

  test('subscribes to TownController events when component mounts', () => {
    render(<CurrencyLeaderboard />);
    expect(mockTownController.on).toHaveBeenCalledWith(
      'allTimeCurrencyChanged',
      expect.any(Function),
    );
  });

  test('subscribes to TownController events when component mounts', () => {
    render(<CurrencyLeaderboard />);
    expect(mockTownController.on).toHaveBeenCalledWith(
      'currentCurrencyChanged',
      expect.any(Function),
    );
  });

  test('unsubscribes from TownController events when component unmounts', () => {
    const { unmount } = render(<CurrencyLeaderboard />);
    unmount();
    expect(mockTownController.off).toHaveBeenCalledWith(
      'allTimeCurrencyChanged',
      expect.any(Function),
    );
  });

  it('unsubscribes from TownController events when component unmounts', () => {
    const { unmount } = render(<CurrencyLeaderboard />);
    unmount();
    expect(mockTownController.off).toHaveBeenCalledWith(
      'currentCurrencyChanged',
      expect.any(Function),
    );
  });

  it('removes a player from current leaderboard when they leave', () => {
    // Simulate a player leaving the town
    const mockCurrencyMap = new Map([
      ['player1', 1000],
      ['player2', 500],
      ['player3', 750],
    ]);
    // Set the mock currency map for the current leaderboard
    (mockTownController.getCurrentCurrency as jest.Mock).mockReturnValue(mockCurrencyMap);

    const { queryByText, unmount } = render(<CurrencyLeaderboard />);
    // Simulate player2 leaving the town
    (mockTownController.getCurrentCurrency as jest.Mock).mockReturnValue(
      new Map([...mockCurrencyMap].filter(([playerID]) => playerID !== 'player2')),
    );
    unmount();
    // Verify that player2 is removed from the current leaderboard
    expect(queryByText('player2')).toBeNull();
  });

  test('sorts and displays the top 5 players in the current leaderboard', () => {
    // Mock the town controller hook
    const mockCurrencyMap = new Map([
      ['player1', 1000],
      ['player2', 900],
      ['player3', 800],
      ['player4', 700],
      ['player6', 500],
      ['player5', 600],
    ]);
    // Set the mock currency map for the current leaderboard
    (mockTownController.getCurrentCurrency as jest.Mock).mockReturnValue(mockCurrencyMap);

    const { getByText, queryByText } = render(<CurrencyLeaderboard />);

    // Check if the top 5 players are displayed in the current leaderboard
    expect(getByText('player1: 1000')).toBeInTheDocument();
    expect(getByText('player2: 900')).toBeInTheDocument();
    expect(getByText('player3: 800')).toBeInTheDocument();
    expect(getByText('player4: 700')).toBeInTheDocument();
    expect(getByText('player5: 600')).toBeInTheDocument();

    // Ensure that player6 or any other players are not displayed
    expect(queryByText('player6: 500')).toBeNull();
  });

  test('sorts and displays the top 5 players in the all-time leaderboard', () => {
    // Mock the currency data for all-time leaderboard
    const mockAllTimeCurrencyMap = new Map([
      ['player1', 10],
      ['player2', 9],
      ['player3', 8],
      ['player4', 7],
      ['player6', 5],
      ['player5', 6],
    ]);
    // Set the mock data for getAllTimeCurrency
    (mockTownController.getAllTimeCurrency as jest.Mock).mockReturnValue(mockAllTimeCurrencyMap);

    const { getByText, queryByText } = render(<CurrencyLeaderboard />);

    // Check if the top 5 players are displayed in the all-time leaderboard
    expect(getByText('player1: 10')).toBeInTheDocument();
    expect(getByText('player2: 9')).toBeInTheDocument();
    expect(getByText('player3: 8')).toBeInTheDocument();
    expect(getByText('player4: 7')).toBeInTheDocument();
    expect(getByText('player5: 6')).toBeInTheDocument();

    // Ensure that player6 or any other players out of the top-5 are not displayed
    expect(queryByText('player6: 5')).toBeNull();
  });
});
