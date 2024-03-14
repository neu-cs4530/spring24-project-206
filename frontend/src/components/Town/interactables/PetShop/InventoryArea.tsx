import {
  Box,
  Button,
  chakra,
  ComponentWithAs,
  Container,
  ContainerProps,
  Grid,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { useCallback } from 'react';
import { useInteractable } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import Inventory from './Inventory';
import closeButton from './petshop-images/x_btn.png';
import inventoryBackground from './inventory-images/inventory_bg.png';
import unequippedSlot from './inventory-images/inventory_slot_bg.png';
import equippedSlot from './inventory-images/inventory_slot_bg_equipped.png';
import { Pet } from './types/pet';
import emptyPet from './inventory-images/inventory_slot_bg_empty.png';
import dog from './inventory-images/coin_count.png';
import equippedButton from './inventory-images/equip_btn.png';
import unequippedButton from './inventory-images/unequip_btn.png';

function PetInventorySlot({ type, equipped }: Pet): JSX.Element {
  let petImage = <Image src={emptyPet.src} />;
  let slotImage = <></>;
  let equipButton = <></>;
  if (equipped) {
    equipButton = <Image src={unequippedButton.src}></Image>;
    slotImage = <Image src={equippedSlot.src} />;
  } else {
    equipButton = <Image src={equippedButton.src}></Image>;
    slotImage = <Image src={unequippedSlot.src} />;
  }
  if (type === 'dog') {
    petImage = <Image src={dog.src} bgImage={equippedSlot.src} bgSize='initial'></Image>;
  }

  return (
    <Box position='relative'>
      {petImage}
      {equipButton}
    </Box>
  );
}

function InventoryArea(): JSX.Element {
  // Array of pets
  const imageSources = [unequippedSlot, unequippedSlot, unequippedSlot];

  return (
    <Box position='relative'>
      {/* Background Image */}
      <Image src={inventoryBackground.src} position='absolute' top='0' left='0' zIndex='-1' />

      {/* Grid of Images */}
      <Grid templateColumns='repeat(3, 1fr)' gap={4}>
        {/* {imageSources.map((im, index) => (
          <Image src={im.src} key={index} position='relative' top='100px'></Image>
        ))} */}
        <PetInventorySlot petID={0} type={'dog'} playerID={0} speed={0} equipped={true} />
      </Grid>
    </Box>
  );
}

/**
 * Using the player ID, renders the pet options that the player can buy
 * @param PlayerID the player ID of the current player
 */
export default function InventoryAreaWrapper(): JSX.Element {
  // fetch the player ID
  const townController = useTownController();
  const inventoryArea = useInteractable<Inventory>('inventory');
  const currentID = townController.ourPlayer.id;
  const closeModal = useCallback(() => {
    if (inventoryArea) {
      townController.interactEnd(inventoryArea);
    }
  }, [townController, inventoryArea]);
  const open = true;
  if (open) {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false} size='xl'>
        <ModalOverlay />
        <ModalContent bgColor='transparent'>
          <ModalCloseButton
            bgImage={closeButton.src}
            objectFit='fill'
            bgSize='contain'
            onClick={closeModal}
          />
          <InventoryArea />
          {/* <ModalBody>
            <Image src={shop_bg} boxSize='lg' onClick={() => console.log('clicked!')}></Image>
          </ModalBody> */}
        </ModalContent>
      </Modal>
    );
  }
  // using the player ID, fetch the list of pets they have already bought (from MongoDB)
  // rendering:
  // inventory background
  // render each pet in each slot for this player
  // align equip button (if this pet is equiped then use unequip button)
  // display currency at the top
  // previous/forward buttons

  return <img alt='Inventory' src='/inventory-images/inventory_bg.png'></img>;
}
