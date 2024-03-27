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
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable, usePetShopController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import PetShop from './PetShop';
import shopBackground from './petshop-images/shop_bg.png';
import closeButton from './petshop-images/x_btn.png';
import coinCount from './petshop-images/coin_count.png';
import forwardButton from './petshop-images/forward_btn.png';
import backButton from './petshop-images/back_btn.png';
import slotBackground from './petshop-images/pet_slot_bg.png';
import slotBackgroundDisabled from './petshop-images/pet_slot_bg_disabled.png';
import { PetCatalog } from '../../../../../../townService/src/lib/PetCatalog';
import { Pet } from '../../../../../../townService/src/lib/Pet';
import one from './pet-images/1.png';
import two from './pet-images/2.png';
import three from './pet-images/3.png';
import four from './pet-images/4.png';
import five from './pet-images/5.png';
import six from './pet-images/6.png';
import seven from './pet-images/7.png';
import eight from './pet-images/8.png';
import nine from './pet-images/9.png';
import ten from './pet-images/10.png';
import eleven from './pet-images/11.png';
import twelve from './pet-images/12.png';
import adoptButton from './petshop-images/adopt_btn.png';
import PetShopController from '../../../../classes/interactable/PetShopController';
import { InteractableID, PlayerID } from '../../../../types/CoveyTownSocket';
import {
  findPetsByPlayer,
  findPetsInCatalog,
} from '../../../../../../townService/src/town/Database';

interface PetShopProps {
  petCatalog: PetCatalog;
  controller: PetShopController;
  playersPets: Pet[];
}

function PetShopSlot({ petCatalog, controller, playersPets }: PetShopProps): JSX.Element {
  const toast = useToast();
  let background = <Image src={slotBackground.src} />;
  let adoptElement = (
    <IconButton
      icon={
        <Image
          src={adoptButton.src}
          onClick={async () => {
            try {
              await controller.adopt(petCatalog.type);
            } catch (e) {
              toast({
                title: 'Error adopting',
                description: (e as Error).toString(),
                status: 'error',
              });
            }
          }}
        />
      }
      aria-label={'adopt-button'}
    />
  );
  // if the player has not bought the pet, make the
  if (playersPets.map(pet => pet.type).includes(petCatalog.type)) {
    background = <Image src={slotBackgroundDisabled.src} />;
    adoptElement = <></>;
  }

  const petImages = [one, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve];

  // Construct the image source based on petCatalog.type
  const petImageSrc = petImages[petCatalog.img_id - 1]?.src || '';
  const petImage = (
    <Image
      src={petImageSrc}
      alt={petCatalog.img_id.toString()}
      width='50%' // Adjust the width as desired
      height='50%' // Adjust the height as desired
      objectFit='cover'
      position='absolute'
      bottom='0'
      left='25%'
    />
  );
  // const petImage = <Image src={dog2.src} />;
  const slot = (
    <Box>
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
          {petImage}
        </Box>
      </Box>
      <Box>{adoptElement}</Box>
    </Box>
  );
}

function PetShopArea({
  interactableID,
  playerID,
}: {
  interactableID: InteractableID;
  playerID: PlayerID;
}) {
  const controller = usePetShopController(interactableID);

  const [petsCatalog, setPlayerCatalog] = useState<PetCatalog[]>([]);
  useEffect(() => {
    const getTheCatalog = async () => {
      try {
        const catalog = await findPetsInCatalog();
        setPlayerCatalog(catalog);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    // Immediately invoke the async function
    getTheCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [pets, setPets] = useState<Pet[]>([]);
  useEffect(() => {
    const getThePets = async () => {
      try {
        const playerpets = await findPetsByPlayer(playerID);
        setPets(playerpets);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    // Immediately invoke the async function
    getThePets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {petsCatalog.slice(0, 6).map((pet, index) => (
          <PetShopSlot key={index} petCatalog={pet} controller={controller} playersPets={pets} />
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
 */
export default function PetShopAreaWrapper(): JSX.Element {
  const petArea = useInteractable<PetShop>('petShop');

  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (petArea) {
      townController.interactEnd(petArea);
    }
  }, [townController, petArea]);
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
          <PetShopArea interactableID={petArea.name} playerID={townController.ourPlayer.id} />
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
