import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import { Pet } from '../lib/Pet';
import {
  BoundingBox,
  InteractableCommand,
  InteractableCommandReturnType,
  PetShopArea as PetShopAreaModel,
  TownEmitter,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';
import { updateCounterForPet } from '../pet-shop/pets-catalog-dao';
import { createPet } from '../pets/pets-dao';
import { findOnePlayerCurrency, findPetPrice, updateOnePlayerCurrency } from './Database';
import { logError } from '../Utils';

export default class PetShopArea extends InteractableArea {
  public pets?: Pet[];

  public constructor(
    { pets, id }: Omit<PetShopAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this.pets = pets;
  }

  public toModel(): PetShopAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      pets: this.pets,
      type: 'PetShopArea',
    };
  }

  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): PetShopArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new PetShopArea({ id: name, occupants: [] }, rect, broadcastEmitter);
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'AdoptPet') {
      this._adoptPet(command.petType, player.id);
    }
    return undefined as InteractableCommandReturnType<CommandType>;
  }

  /**
   * Awaits the update counter method from the backend
   * @param type The type of the pet
   */
  private async _incrementPopularity(type: string) {
    try {
      await updateCounterForPet(type);
    } catch (error) {
      logError(`Could not update popularity counter: ${(error as Error).message}`);
    }
  }

  /**
   * Awaits the deduct currency method from the backend
   * @param type The type of the pet
   */
  private async _updateCurrency(playerID: string, newValue: number) {
    try {
      await updateOnePlayerCurrency(playerID, newValue);
    } catch (error) {
      logError(`Could not update currency: ${(error as Error).message}`);
    }
  }

  /**
   * Attempts to adopt the pet
   * @param playerID the ID of the current player
   * @param petType the type of the pet being adopted
   */
  private async _adoptPet(playerID: string, petType: string) {
    console.log(playerID);
    console.log(petType);
    console.log('IN ADOPT PET - town service');
    console.log('currency!');
    const currency = await findOnePlayerCurrency(playerID);
    console.log(currency);
    const petPrice = await findPetPrice(petType);
    console.log('pet price!');
    console.log(petPrice);

    if (currency === null || petPrice === null) {
      throw new Error('why null');
    }

    if (currency < petPrice) {
      throw new Error(`Insufficient currency to adopt pet!`);
    } else {
      // make sure that the pet has not already been bought by the player
      // const adoptedPets = await findPetsByPlayer(playerID);
      // console.log(adoptedPets);
      // if the pet already exists, throw an error?
      // throw new Error(`Pet has already been adopted!`);
      // else make the purchase
      const newPet = await createPet({
        type: petType,
        playerID,
        equipped: false,
      });
      await this._updateCurrency(playerID, currency - petPrice);
      await this._incrementPopularity(petType);
      this.pets?.push(newPet);
      // townEmitter.emit('petAdopted', this.pets);
    }
  }
}
