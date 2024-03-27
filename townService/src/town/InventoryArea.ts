import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import { Pet } from '../lib/Pet';
import {
  BoundingBox,
  InteractableCommand,
  InteractableCommandReturnType,
  InventoryArea as InventoryAreaModel,
  TownEmitter,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';
import { addPet } from './Database';

export default class InventoryArea extends InteractableArea {
  public pets?: Pet[];

  public constructor(
    { pets, id }: Omit<InventoryAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this.pets = pets;
  }

  public toModel(): InventoryAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      pets: this.pets,
      type: 'InventoryArea',
    };
  }

  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): InventoryArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new InventoryArea({ id: name, occupants: [] }, rect, broadcastEmitter);
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'AdoptPet') {
      addPet({
        type: command.petType,
        playerID: player.id,
        equipped: true,
      });
    }
    return undefined as InteractableCommandReturnType<CommandType>;
  }
}
