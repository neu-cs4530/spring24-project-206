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
import PetShop from './PetShop';
import shopBackground from './petshop-images/shop_bg.png';
import closeButton from './petshop-images/x_btn.png';

let bgColour = 'red';
function myClick(): void {
  if (bgColour == 'red') {
    bgColour = 'yellow';
  } else {
    bgColour = 'red';
  }
  console.log('clicked!!!');
}

function PetShopArea(): JSX.Element {
  console.log(shopBackground);
  const petShopGrid = <Image src={shopBackground.src} boxSize='lg'></Image>;
  // return <PetShopContainer></PetShopContainer>;
  return petShopGrid;
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
  const open = true;
  if (open) {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false} size='xl'>
        <ModalOverlay />
        <ModalContent bgColor='transparent'>
          {/* <ModalHeader>Pet Shop</ModalHeader> */}
          <ModalCloseButton
            bgImage={closeButton.src}
            objectFit='fill'
            bgSize='contain'
            onClick={closeModal}
          />
          {/* <Image src={closeButton.src} onClick={closeModal} /> */}
          <PetShopArea />
          {/* <ModalBody>
            <Image src={shop_bg} boxSize='lg' onClick={() => console.log('clicked!')}></Image>
          </ModalBody> */}
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

  return <img alt='Pet shop' src='/petshop-images/shop_bg.png'></img>;
}
