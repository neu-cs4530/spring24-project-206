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
import closeButton from '../../../../../public/assets/pet-shop/ui/close_btn.png';
import inventoryBackground from '../../../../../public/assets/pet-shop/ui/inventory_bg.png';
import unequippedSlot from '../../../../../public/assets/pet-shop/ui/inventory_slot_bg.png';
import equippedSlot from '../../../../../public/assets/pet-shop/ui/inventory_slot_bg_equipped.png';
import equipBtnAsset from '../../../../../public/assets/pet-shop/ui/equip_btn.png';
import unequipBtnAsset from '../../../../../public/assets/pet-shop/ui/unequip_btn.png';
import backButton from '../../../../../public/assets/pet-shop/ui/back_btn.png';
import forwardButton from '../../../../../public/assets/pet-shop/ui/forward_btn.png';
import one from '../../../../../public/assets/pet-shop/pet-sprites/1.png';
import two from '../../../../../public/assets/pet-shop/pet-sprites/2.png';
import three from '../../../../../public/assets/pet-shop/pet-sprites/3.png';
import four from '../../../../../public/assets/pet-shop/pet-sprites/4.png';
import five from '../../../../../public/assets/pet-shop/pet-sprites/5.png';
import six from '../../../../../public/assets/pet-shop/pet-sprites/6.png';
import seven from '../../../../../public/assets/pet-shop/pet-sprites/7.png';
import eight from '../../../../../public/assets/pet-shop/pet-sprites/8.png';
import nine from '../../../../../public/assets/pet-shop/pet-sprites/9.png';
import ten from '../../../../../public/assets/pet-shop/pet-sprites/10.png';
import eleven from '../../../../../public/assets/pet-shop/pet-sprites/11.png';
import twelve from '../../../../../public/assets/pet-shop/pet-sprites/12.png';
import CurrencyDisplay from './CurrencyDisplay';

// Color of pet type and information
const TEXT_COLOR = '#2CAB3F';
const EQUIPPED_TEXT_COLOR = '#B73848';

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
  const slotButton = (
    <IconButton
      bg='transparent'
      _hover={{ bg: 'transparent' }}
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
        fontSize='9px'
        color={pet.equipped ? EQUIPPED_TEXT_COLOR : TEXT_COLOR}
        textAlign='center'>
        Speed: {petCatalog.speed}
      </Text>
      <Text
        pos='absolute'
        top='-23px'
        left='0'
        width='100%' // Ensure the text spans the entire width of the box
        textAlign='center' // Center the text horizontally
        fontFamily='monospace'
        fontWeight='bold'
        fontSize='10px'
        color={pet.equipped ? EQUIPPED_TEXT_COLOR : TEXT_COLOR} // Adjust color as needed
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
      {petsCatalog.length > 0 && (
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
      )}
      {/* Coin Count Image */}
      <CurrencyDisplay currency={10} />
      {/* back button */}
      <Box position='absolute' left='0' top='410' boxSize='42px'>
        <IconButton
          bg='transparent'
          _hover={{ bg: 'transparent' }}
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
          _hover={{ bg: 'transparent' }}
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
            color='transparent'
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
