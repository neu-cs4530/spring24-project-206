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
import { equipPet, unequipPet } from '../pets/pets-dao';

// Define the InventoryArea class, which extends InteractableArea
export default class InventoryArea extends InteractableArea {
  public pets?: Pet[];

  // Constructor for creating an InventoryArea instance
  public constructor(
    { pets, id }: Omit<InventoryAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this.pets = pets;
  }

  // Method to convert the InventoryArea instance to a model
  public toModel(): InventoryAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id), // IDs of players occupying the area
      pets: this.pets, // Array of pets in the inventory area
      type: 'InventoryArea',
    };
  }

  // Static method to create an InventoryArea instance from a Tiled map object
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

  // Method to handle commands sent to the inventory area
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'EquipPet') {
      equipPet(player.id, command.petType);
    }
    if (command.type === 'UnequipPet') {
      unequipPet(player.id, command.petType);
    }
    return undefined as InteractableCommandReturnType<CommandType>;
  }
}
