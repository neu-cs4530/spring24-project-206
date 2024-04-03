import { Box, Image, Text } from '@chakra-ui/react';
import coinCount from './petshop-images/coin_count.png';
import React from 'react';

// Color of currency display
const TEXT_COLOR = '#88643e';

interface CurrencyDisplayProps {
  currency: number;
}

export default function CurrencyDisplay({ currency }: CurrencyDisplayProps): JSX.Element {
  return (
    <Box position='absolute' right='50' top='0' boxSize='100px'>
      <Image src={coinCount.src} />
      <Text
        position='relative'
        top='-35%'
        left='35%'
        fontFamily='monospace'
        fontWeight='bold'
        color={TEXT_COLOR}>
        {currency}
      </Text>
    </Box>
  );
}
