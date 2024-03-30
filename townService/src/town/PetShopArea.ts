import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import { useState, useEffect } from 'react';
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

  _fetchCurrency = (playerID: string) => {
    const [currency, setCurrency] = useState<number>(0);
    useEffect(() => {
      const getCurrency = async () => {
        try {
          const fetchedCurrency = await findOnePlayerCurrency(playerID);
          setCurrency(fetchedCurrency);
          console.log(`new currency = ${fetchedCurrency}`);
        } catch (error) {
          console.error('Error fetching player currency: ', error);
        }
      };
      // Immediately invoke the async function
      getCurrency();
    }, []);
    return currency;
  };

  _fetchPetPrice = (type: string) => {
    const [price, setPrice] = useState<number>(0);
    useEffect(() => {
      const getPrice = async () => {
        try {
          const petPrice = await findPetPrice(type);
          setPrice(petPrice);
          console.log(`price for ${type} = ${petPrice}`);
        } catch (error) {
          throw new Error('Error fetching pet price: ', error as Error);
        }
      };
      // Immediately invoke the async function
      getPrice();
    }, []);
    return price;
  };

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'AdoptPet') {
      const price = this._fetchPetPrice(command.petType);
      const currency = this._fetchCurrency(player.id);
      // TODO: check whether they have sufficient currency
      if (currency >= price) {
        createPet({
          type: command.petType,
          playerID: player.id,
          equipped: true,
        });
        this._incrementPopularity(command.petType);
        // TODO: deduct currency
        this._updateCurrency(player.id, currency - price);
      } else {
        console.error('Insufficient funds');
      }
    }
    return undefined as InteractableCommandReturnType<CommandType>;
  }

  /**
   * Awaits the update counter method from the backend
   * @param type The type of the pet
   */
  private async _incrementPopularity(type: string) {
    await updateCounterForPet(type);
  }

  /**
   * Awaits the deduct currency method from the backend
   * @param type The type of the pet
   */
  private async _updateCurrency(playerID: string, newValue: number) {
    await updateOnePlayerCurrency(playerID, newValue);
  }
}
