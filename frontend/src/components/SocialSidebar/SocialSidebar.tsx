import React from 'react';
import { Heading, StackDivider, VStack } from '@chakra-ui/react';
import InteractableAreasList from './InteractableAreasList';
import PlayersList from './PlayersList';
import TownController from '../../classes/TownController';
import CurrencyLeaderboard from '../Town/interactables/CurrencyLeaderboard';

interface SocialSidebarProps {
  townController: TownController;
}

/**
 * This creates a social sidebar. Added the currency leaderboard here
 * @returns a sidebar
 */
const SocialSidebar: React.FC<SocialSidebarProps> = () => {
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
      {/* Render CurrencyLeaderboard component */}
      <CurrencyLeaderboard />
      <Heading fontSize='xl' as='h1'>
        Players In This Town
      </Heading>
      <PlayersList />
      <InteractableAreasList />
    </VStack>
  );
};

export default SocialSidebar;
