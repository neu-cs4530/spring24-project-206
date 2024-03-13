import {
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

function InventoryArea(): JSX.Element {
  return <></>;
}

/**
 * Using the player ID, renders the pet options that the player can buy
 * @param PlayerID the player ID of the current player
 */
export default function PetShopAreaWrapper(): JSX.Element {
  // fetch the player ID
  const townController = useTownController();
  const inventoryArea = useInteractable<Inventory>('inventory');
  const currentID = townController.ourPlayer.id;
  const closeModal = useCallback(() => {
    if (inventoryArea) {
      townController.interactEnd(inventoryArea);
    }
  }, [townController, inventoryArea]);
  if (inventoryArea) {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false} size='xl'>
        <ModalOverlay />
        {/* <ModalContent>
          <ModalHeader>{inventoryArea.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <PetShopArea />
          </ModalBody>
        </ModalContent> */}
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
