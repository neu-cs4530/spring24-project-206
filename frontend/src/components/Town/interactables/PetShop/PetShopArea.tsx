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
import PetShop from './PetShop';

function PetShopArea(): JSX.Element {
  return <></>;
}

/**
 * Using the player ID, renders the pet options that the player can buy
 * @param PlayerID the player ID of the current player
 */
export default function PetShopAreaWrapper(): JSX.Element {
  // fetch the player ID
  const townController = useTownController();
  const petShopArea = useInteractable<PetShop>('petShop');
  const currentID = townController.ourPlayer.id;
  const closeModal = useCallback(() => {
    if (petShopArea) {
      townController.interactEnd(petShopArea);
    }
  }, [townController, petShopArea]);
  if (petShopArea) {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{petShopArea.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <PetShopArea />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
  // using the player ID, fetch the list of pets they have already bought (from MongoDB)
  // rendering:
  // pet shop background
  // currency above the pet shop (overlay the amount)
  // for all pets, render the text to be overlayed
  // name of the pet: above the slot
  // info: cost, speed, popularity
  // the pets that have already been bought - use the disabled pet slot
  // the pets that have not been bought - use the regular pet slot + adopt button
  // forward button (not on last page)
  // previous button (not on first page) **COULD ALSO THINK OF ROTATING THE PAGE NUMBERS**

  return <img alt='Pet shop' src='/images/shop_bg.png'></img>;
}
