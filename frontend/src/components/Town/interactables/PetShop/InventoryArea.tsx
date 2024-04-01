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
import { useInteractable, useInventoryAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import Inventory from './Inventory';
import InventoryAreaController from '../../../../classes/interactable/InventoryAreaController';
import { InteractableID, PlayerID } from '../../../../../../shared/types/CoveyTownSocket';
import { PetCatalog } from '../../../../../../townService/src/lib/PetCatalog';
import { Pet } from '../../../../../../townService/src/lib/Pet';
import {
  findPetsByPlayer,
  findPetsInCatalog,
} from '../../../../../../townService/src/town/Database';
import { findPetByType } from '../../../../../../townService/src/pet-shop/pet-shop-controller';
// image asset imports
import closeButton from './petshop-images/x_btn.png';
import inventoryBackground from './inventory-images/inventory_bg.png';
import unequippedSlot from './inventory-images/inventory_slot_bg.png';
import equippedSlot from './inventory-images/inventory_slot_bg_equipped.png';
import equipBtnAsset from './inventory-images/equip_btn.png';
import unequipBtnAsset from './inventory-images/unequip_btn.png';
import coinCount from './petshop-images/coin_count.png';
import backButton from './petshop-images/back_btn.png';
import forwardButton from './petshop-images/forward_btn.png';
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

/**
 * The pet and controller taken in by a InventorySlot.
 */
interface InventoryProps {
  pet: Pet;
  petCatalog: PetCatalog;
  controller: InventoryAreaController;
}

/**
 * Returns a pet slot in the inventory.
 */
function InventorySlot({ pet, petCatalog, controller }: InventoryProps): JSX.Element {
  const toast = useToast();
  const toastMessage = pet.equipped ? 'Error unequipping' : 'Error equipping';
  const typeTextColor = '#2CAB3F';
  const slotButton = (
    <IconButton
      bg={'rgba(255, 255, 255, 0)'}
      icon={
        <Image
          src={pet.equipped ? unequipBtnAsset.src : equipBtnAsset.src} // display "Unequip" button
          onClick={async () => {
            try {
              if (pet.equipped) {
                await controller.unequip(pet.type);
              } else {
                await controller.equip(pet.type);
              }
            } catch (e) {
              toast({
                title: toastMessage,
                description: (e as Error).toString(),
                status: 'error',
              });
            }
          }}
        />
      }
      aria-label={pet.equipped ? 'unequip-button' : 'equip-button'}
    />
  );
  const slotBg = pet.equipped ? (
    <Image src={equippedSlot.src} />
  ) : (
    <Image src={unequippedSlot.src} />
  );
  const petImages = [one, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve];
  // Construct the image source based on petCatalog.type
  const petImageSrc = petImages[petCatalog.img_id - 1]?.src || '';
  const petImage = (
    <Image
      src={petImageSrc}
      width='49%' // Adjust the width as desired
      height='49%' // Adjust the height as desired
      objectFit='cover'
      position='absolute'
      bottom='0'
      left='25%'
    />
  );
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
        fontSize='10px'
        textAlign='center'>
        Speed: {petCatalog.speed}
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
        color={typeTextColor} // Adjust color as needed
        zIndex='1'>
        {pet.type}
      </Text>
    </Box>
  );

  return (
    <Box position='relative' top='110px' left='45px' boxSize='100px'>
      <Box position='relative'>
        {slotBg}
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
      <Box>{slotButton}</Box>
    </Box>
  );
}

/**
 * Returns the inventory user screen.
 */
function InventoryArea({
  interactableID,
  playerID,
}: {
  interactableID: InteractableID;
  playerID: PlayerID;
}) {
  const controller = useInventoryAreaController(interactableID);

  // the catalog of pets
  const [petsCatalog, setPetsCatalog] = useState<PetCatalog[]>([]);
  // the player's pets
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // get pets catalog
    const getCatalog = async () => {
      try {
        const catalog = await findPetsInCatalog();
        setPetsCatalog(catalog);
      } catch (e) {
        console.error('Error fetching data: ', e);
      }
    };

    getCatalog();
  }, []);

  useEffect(() => {
    // get the player's pets
    const getPets = async () => {
      try {
        const playerPets = await findPetsByPlayer(playerID);
        setPets(playerPets);
      } catch (e) {
        console.error('Error fetching data: ', e);
      }
    };

    getPets();
  }, [playerID]);

  function findPetByTypeHelp(type: string): PetCatalog {
    const petsByType = petsCatalog.filter(pet => pet.type === type);
    console.log('petsByType');
    console.log(petsByType);
    if (petsByType.length === 0) {
      throw new Error('Catalog does not contain pet of type ' + type);
    } else if (petsByType.length !== 1) {
      throw new Error('Catalog contains more than one pet of type ' + type);
    } else {
      return petsByType[0];
    }
  }

  const petsPerPage = 6; // Number of pets to display per page
  // Calculate the index range for the current page
  const indexOfLastPet = currentPage * petsPerPage;
  const indexOfFirstPet = indexOfLastPet - petsPerPage;
  const currentPets = pets.slice(indexOfFirstPet, indexOfLastPet);

  const currency = 10;
  const coinCountImage = (
    <Box position='absolute' right='50' top='0' boxSize='100px'>
      <Image src={coinCount.src} />
      <Text position='relative' top='-35%' left='35%' fontFamily='monospace' fontWeight='bold'>
        {currency}
      </Text>
    </Box>
  );

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  return (
    <Box position='relative'>
      {/* Inventory Background */}
      <Image src={inventoryBackground.src} position='absolute' />
      {/* Grid of Pets */}
      <Grid
        templateColumns='repeat(3, 1fr)'
        gridAutoFlow='row dense'
        gridRowGap={62}
        gridColumnGap={0}
        justifyContent='center'>
        {currentPets.map((pet, index) => (
          <InventorySlot
            key={index}
            pet={pet}
            petCatalog={findPetByTypeHelp(pet.type)}
            controller={controller}
          />
        ))}
      </Grid>
      {/* Coin Count Image */}
      {coinCountImage}
      {/* back button */}
      <Box position='absolute' left='0' top='410' boxSize='42px'>
        <IconButton
          bg={'rgba(255, 255, 255, 0)'}
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
          bg={'rgba(255, 255, 255, 0)'}
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
 * Displays the inventory.
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
          <InventoryArea
            interactableID={inventoryArea.name}
            playerID={townController.ourPlayer.id}
          />
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
