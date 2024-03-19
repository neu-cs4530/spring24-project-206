import {
  Box,
  Button,
  chakra,
  color,
  ComponentWithAs,
  Container,
  ContainerProps,
  Grid,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  toast,
} from '@chakra-ui/react';
import React, { useCallback } from 'react';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import PetShop from './PetShop';
import shopBackground from './petshop-images/shop_bg.png';
import closeButton from './petshop-images/x_btn.png';
import coinCount from './petshop-images/coin_count.png';
import forwardButton from './petshop-images/forward_btn.png';
import backButton from './petshop-images/back_btn.png';
import slotBackground from './petshop-images/pet_slot_bg.png';
import slotBackgroundDisabled from './petshop-images/pet_slot_bg_disabled.png';
import { PetCatalog } from './types/petCatalog';
import { Pet } from './types/pet';
import dog from './../../../../../public/logo512.png';
import adoptButton from './petshop-images/adopt_btn.png';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import PetShopController from '../../../../classes/interactable/PetShopController';

const PETS = [
  { petID: 1, type: 'chicken', playerID: 1, speed: 1.5, equipped: false },
  { petID: 1, type: 'cat', playerID: 1, speed: 1.5, equipped: true },
  { petID: 1, type: 'dog', playerID: 1, speed: 1.5, equipped: false },
  { petID: 1, type: 'dog', playerID: 1, speed: 1.5, equipped: true },
  { petID: 1, type: 'dog', playerID: 1, speed: 1.5, equipped: false },
  { petID: 1, type: 'dog', playerID: 1, speed: 1.5, equipped: true },
];

const petsOfPlayer: Record<number, Pet[]> = { 1: PETS.slice(0, 2), 2: [], 3: PETS.slice(3, 5) };

function PetShopSlot(petCatalog: PetCatalog, controller: PetShopController): JSX.Element {
  let background = <Image src={slotBackground.src} />;
  let adopt = (
    <IconButton
      icon={
        <Image
          src={adoptButton.src}
          onClick={async () => {
            try {
              await controller.adopt(petCatalog.type);
            } catch (e) {
              // toast({
              //   title: 'Error adopting',
              //   description: (e as Error).toString(),
              //   status: 'error',
              // });
            }
          }}
        />
      }
      aria-label={'adopt-button'}
    />
  );
  // if the player has not bought the pet, make the
  const pets = petsOfPlayer[1];
  if (pets.map(pet => pet.type).includes(petCatalog.type)) {
    background = <Image src={slotBackgroundDisabled.src} />;
    adopt = <></>;
  }
  const petImage = <Image src={dog.src} />;
  const slot = (
    <Box>
      {petImage}
      <Text
        pos='absolute'
        top='0'
        left='initial'
        fontFamily='monospace'
        fontWeight='bold'
        backgroundColor='whiteAlpha.600'>
        Price: {petCatalog.price} Popularity:{petCatalog.counter}
      </Text>
    </Box>
  );
  return (
    <Box position='relative' top='110px' left='45px' boxSize='100px'>
      <Box position='relative'>
        {background}
        <Box
          bgSize='contain'
          boxSize='85'
          position='absolute'
          top='50%'
          left='50%'
          transform='translate(-50%, -50%)'>
          {slot}
        </Box>
      </Box>
      <Box>{adopt}</Box>
    </Box>
  );
}

function PetShopArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const controller = useInteractableAreaController<PetShopController>(interactableID);
  const townController = useTownController();
  // Array of pets
  const petsCatalog: PetCatalog[] = [
    { type: 'dog', speed: 1.5, counter: 0, price: 10 },
    { type: 'chicken', speed: 1.75, counter: 0, price: 12 },
    { type: 'dragon', speed: 1, counter: 0, price: 7 },
    { type: 'chicken', speed: 2.5, counter: 0, price: 5 },
    { type: 'dog', speed: 0.5, counter: 0, price: 9 },
    { type: 'dog', speed: 0.25, counter: 0, price: 3 },
  ];

  const currency = 10;
  const coinCountImage = (
    <Box position='absolute' right='50' top='0' boxSize='100px'>
      <Image src={coinCount.src} />
      <Text position='relative' top='-35%' left='35%' fontFamily='monospace' fontWeight='bold'>
        {currency}
      </Text>
    </Box>
  );

  return (
    <Box position='relative'>
      {/* Inventory Background */}
      <Image src={shopBackground.src} position='absolute' />

      {/* Grid of Pets */}
      <Grid templateColumns='repeat(3, 1fr)' gap={4} gridAutoFlow='row dense' gridRowGap={10}>
        {petsCatalog.map((pet, index) => (
          // <PetShopSlot pet={PETS[0]} petCatalog={pet} key={index} />
          <PetShopSlot key={index} {...pet}></PetShopSlot>
        ))}
      </Grid>

      {/* Coin Count Image */}
      {coinCountImage}

      {/* back button */}
      <Box position='absolute' left='0' top='400' boxSize='50px'>
        <IconButton icon={<Image src={backButton.src} />} aria-label={''} />;
      </Box>

      {/* forward button */}
      <Box position='absolute' right='0' top='400' boxSize='50px'>
        <IconButton icon={<Image src={forwardButton.src} />} aria-label={''} />;
      </Box>
    </Box>
  );
}

/**
 * Using the player ID, renders the pet options that the player can buy
 * @param PlayerID the player ID of the current player
 */
export default function PetShopAreaWrapper(): JSX.Element {
  const petArea = useInteractable<PetShop>('petShop');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (petArea) {
      townController.interactEnd(petArea);
      // i think we need to create a pet controller and add it to classes/interactable and then create a new method getPetAreaController
      // const controller = townController.getPetShopAreaController(petArea);
      // controller.leaveGame();
    }
  }, [townController, petArea]);
  const open = true;
  if (petArea) {
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
          <PetShopArea interactableID={petArea.id} />
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
