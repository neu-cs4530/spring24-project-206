import { Heading, StackDivider, VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import TownController, { useCurrencyMap } from '../../classes/TownController';
import CurrencyLeaderboard from '../Town/interactables/CurrencyLeaderboard';
import InteractableAreasList from './InteractableAreasList';
import PlayersList from './PlayersList';

interface SocialSidebarProps {
  townController: TownController; // Make the prop optional
}

interface SocialSidebarProps {
  townController: TownController;
}

const SocialSidebar: React.FC<SocialSidebarProps> = ({ townController }) => {
  // const playerCurrencyMap = useCurrencyMap(townController);

  const [playerCurrencyMap, setPlayerCurrencyMap] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const updateCurrency = (currency: Map<string, number>) => {
      setPlayerCurrencyMap(new Map(currency));
    };

    if (townController) {
      townController.addListener('currencyChanged', updateCurrency);

      return () => {
        townController.removeListener('currencyChanged', updateCurrency);
      };
    }
  }, [townController]);

  return (
    <VStack
      align='left'
      spacing={2}
      border='2px'
      padding={2}
      marginLeft={2}
      borderColor='gray.500'
      height='100%'
      divider={<StackDivider borderColor='gray.200' />}
      borderRadius='4px'>
      {/* Pass playerCurrencyMap as prop to CurrencyLeaderboard component */}
      <CurrencyLeaderboard playerCurrencyMap={playerCurrencyMap} />
      <Heading fontSize='xl' as='h1'>
        Players In This Town
      </Heading>
      <PlayersList />
      <InteractableAreasList />
    </VStack>
  );
};

export default SocialSidebar;
