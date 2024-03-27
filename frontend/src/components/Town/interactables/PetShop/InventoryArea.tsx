import {
  Box,
  Grid,
  IconButton,
  Image,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React, { useCallback } from 'react';
import { useInteractable } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import Inventory from './Inventory';
import closeButton from './petshop-images/x_btn.png';
import inventoryBackground from './inventory-images/inventory_bg.png';
import unequippedSlot from './inventory-images/inventory_slot_bg.png';
import equippedSlot from './inventory-images/inventory_slot_bg_equipped.png';
import { Pet } from '../../../../../../townService/src/lib/Pet';
import emptyPet from './inventory-images/inventory_slot_bg_empty.png';
import dog from './inventory-images/pet.png';
import equippedButton from './inventory-images/equip_btn.png';
import unequippedButton from './inventory-images/unequip_btn.png';
import coin_count from './inventory-images/coin_count.png';
import forward_btn from './inventory-images/forward_btn.png';
import back_btn from './inventory-images/back_btn.png';

function PetInventorySlot({ type, equipped }: Pet): JSX.Element {
  let petImage = <Image src={emptyPet.src} />;
  let slotImage = <></>;
  let equipButton = <></>;
  // ADD onclick
  if (equipped) {
    equipButton = <IconButton icon={<Image src={unequippedButton.src} />} aria-label={''} />;
    slotImage = <Image src={equippedSlot.src} />;
  } else {
    equipButton = <IconButton icon={<Image src={equippedButton.src} />} aria-label={''} />;
    slotImage = <Image src={unequippedSlot.src} />;
  }
  if (type === 'dog') {
    petImage = <Image src={dog.src} boxSize='50px'></Image>;
  }

  return (
    <Box position='relative' top='110px' left='45px' boxSize='100px'>
      <Box position='relative'>
        {slotImage}
        <Box position='absolute' top='50%' left='50%' transform='translate(-50%, -50%)'>
          {petImage}
        </Box>
      </Box>
      <Box>{equipButton}</Box>
    </Box>
  );
}

function InventoryArea(): JSX.Element {
  // Array of pets
  const pets = [
    { type: 'chicken', playerID: '1', equipped: false },
    { type: 'cat', playerID: '1', equipped: true },
    { type: 'dog', playerID: '1', equipped: false },
    { type: 'dog', playerID: '1', equipped: true },
    { type: 'dog', playerID: '1', equipped: false },
    { type: 'dog', playerID: '1', equipped: true },
  ];

  const currency = 10;
  const coinCountImage = (
    <Box position='absolute' right='50' top='0' boxSize='100px'>
      <Image src={coin_count.src} />
      <Text position='relative' top='-35%' left='35%' fontFamily='monospace' fontWeight='bold'>
        {currency}
      </Text>
    </Box>
  );

  return (
    <Box position='relative'>
      {/* Inventory Background */}
      <Image src={inventoryBackground.src} position='absolute' />

      {/* Grid of Pets */}
      <Grid templateColumns='repeat(3, 1fr)' gap={4} gridAutoFlow='row dense' gridRowGap={10}>
        {pets.map((pet, index) => (
          <PetInventorySlot key={index} {...pet} />
        ))}
      </Grid>

      {/* Coin Count Image */}
      {coinCountImage}

      {/* back button */}
      <Box position='absolute' left='0' top='400' boxSize='50px'>
        <IconButton icon={<Image src={back_btn.src} />} aria-label={''} />;
      </Box>

      {/* forward button */}
      <Box position='absolute' right='0' top='400' boxSize='50px'>
        <IconButton icon={<Image src={forward_btn.src} />} aria-label={''} />;
      </Box>
    </Box>
  );
}

/**
 * Using the player ID, renders the pet options that the player can buy
 * @param PlayerID the player ID of the current player
 */
export default function InventoryAreaWrapper(): JSX.Element {
  // fetch the player ID
  const inventoryArea = useInteractable<Inventory>('inventory');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (inventoryArea) {
      townController.interactEnd(inventoryArea);
    }
  }, [townController, inventoryArea]);
  if (inventoryArea) {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false} size='xl'>
        <ModalOverlay />
        <ModalContent bgColor='transparent'>
          <ModalCloseButton
            bgImage={closeButton.src}
            objectFit='fill'
            bgSize='contain'
            onClick={closeModal}
            zIndex='modal'
          />
          <InventoryArea />
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
