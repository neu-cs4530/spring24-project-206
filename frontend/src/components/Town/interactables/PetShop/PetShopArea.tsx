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
import CurrencyDisplay from './CurrencyDisplay';

// Defines the props for PetShopSlot component
interface PetShopProps {
  petCatalog: PetCatalog;
  controller: PetShopController;
  playersPets: Pet[];
}

// Color of pet type text
const TYPE_COLOR = '#4f361c';
// Color of pet information
const TEXT_COLOR = '#88643e';

// Defines the PetShopSlot component
function PetShopSlot({ petCatalog, controller, playersPets }: PetShopProps): JSX.Element {
  const toast = useToast();
  // Initializes the background and adoptElement based on player's ownership of the pet
  let background = <Image src={slotBackground.src} />;
  let adoptElement = (
    <IconButton
      bg='transparent'
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

  // Initializes the petImages array to map pet images to their respective IDs
  const petImages = [one, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve];

  // Constructs the image source based on petCatalog.img_id
  const petImageSrc = petImages[petCatalog.img_id - 1]?.src || '';
  const petImage = (
    <Image
      src={petImageSrc}
      alt={petCatalog.img_id.toString()}
      width='49%'
      height='49%'
      objectFit='cover'
      position='absolute'
      bottom='0'
      left='25%'
    />
  );

  // Defines the JSX for slot information
  // It displays the price, popularity, speed and name for each of the pets in the pet shop
  const slot = (
    <Box>
      <Text
        pos='absolute'
        top='0px'
        left='initial'
        width='100%'
        fontFamily='monospace'
        fontWeight='bold'
        backgroundColor='whiteAlpha.600'
        fontSize='9px'
        color={TEXT_COLOR}
        textAlign='center'>
        Price: {petCatalog.price} <br /> Popularity: {petCatalog.counter} <br /> Speed:{' '}
        {petCatalog.speed}
      </Text>
      <Text
        pos='absolute'
        top='-20px'
        left='0'
        width='100%' // Ensure the text spans the entire width of the box
        textAlign='center' // Center the text horizontally
        fontFamily='monospace'
        fontWeight='bold'
        fontSize='9px'
        color={TYPE_COLOR}
        zIndex='1'>
        {petCatalog.type}
      </Text>
    </Box>
  );
  // Creates a visual representation of a pet shop slot, including the background, pet image,
  // textual information, and an adopt button, all properly positioned and styled
  return (
    <Box position='relative' top='115px' left='45px' boxSize='100px' width='55%'>
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

// Defines the PetShopArea component
function PetShopArea({
  interactableID,
  playerID,
}: {
  interactableID: InteractableID;
  playerID: PlayerID;
}) {
  // Initializes the PetShopController hook
  const controller = usePetShopController(interactableID);

  // Initializes the state variables for petsCatalog
  const [petsCatalog, setPlayerCatalog] = useState<PetCatalog[]>([]);
  // Initializes the state variables for pets
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const getCatalog = async () => {
      try {
        const catalog = await findPetsInCatalog();
        setPlayerCatalog(catalog);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    // Immediately invoke the async function
    getCatalog();
  }, [playerID]);

  useEffect(() => {
    const getPets = async () => {
      try {
        const playerPets = await findPetsByPlayer(playerID);
        setPets(playerPets);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    // Immediately invokes the async function
    getPets();
  }, [playerID]);

  const petsPerPage = 6; // Number of pets to display per page
  // Calculate the index range for the current page
  const indexOfLastPet = currentPage * petsPerPage;
  const indexOfFirstPet = indexOfLastPet - petsPerPage;
  const currentPets = petsCatalog.slice(indexOfFirstPet, indexOfLastPet);

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  return (
    <Box position='relative'>
      {/* Inventory Background */}
      <Image src={shopBackground.src} position='absolute' />
      {/* Grid of Pets */}
      <Grid
        templateColumns='repeat(3, 1fr)'
        gridAutoFlow='row dense'
        gridRowGap={62}
        gridColumnGap={0}
        justifyContent='center'>
        {currentPets.map((pet, index) => (
          <PetShopSlot key={index} petCatalog={pet} controller={controller} playersPets={pets} />
        ))}
      </Grid>
      {/* Coin Count Image */}
      <CurrencyDisplay currency={10} />
      {/* back button */}
      <Box position='absolute' left='0' top='410' boxSize='42px'>
        <IconButton
          bg='transparent'
          icon={<Image src={backButton.src} />}
          aria-label={''}
          onClick={prevPage}
          disabled={currentPage === 1}
        />
        ;
      </Box>
      {/* forward button */}
      <Box position='absolute' right='0' top='410' boxSize='42px'>
        <IconButton
          bg='transparent'
          icon={<Image src={forwardButton.src} />}
          aria-label={''}
          onClick={nextPage}
          disabled={indexOfLastPet >= petsCatalog.length}
        />
        ;
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
