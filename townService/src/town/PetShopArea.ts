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
      createPet({
        type: command.petType,
        playerID: player.id,
        equipped: true,
      });
      this._increment(command.petType);
    }
    return undefined as InteractableCommandReturnType<CommandType>;
  }

  /**
   * Awaits the update counter method from the backend
   * @param type The type of the pet
   */
  private async _increment(type: string) {
    await updateCounterForPet(type);
  }
}
