import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import {
  BoundingBox,
  InteractableCommand,
  InteractableCommandReturnType,
  InventoryArea as InventoryAreaModel,
  TownEmitter,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';
import { equipPetInDao, unequipPetInDao } from '../pets/pets-dao';

export default class InventoryArea extends InteractableArea {
  private _emitter: TownEmitter;

  public constructor(
    { id }: Omit<InventoryAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._emitter = townEmitter;
  }

  public toModel(): InventoryAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
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
    if (command.type === 'EquipPet') {
      equipPetInDao(player.id, command.toBeEquipped.type);
      this._emitter.emit('petEquipped', command.toBeEquipped);
    }
    if (command.type === 'UnequipPet') {
      unequipPetInDao(player.id, command.petType);
      this._emitter.emit('petUnequipped', { type: command.petType, playerID: command.playerID });
    }
    return undefined as InteractableCommandReturnType<CommandType>;
  }
}
