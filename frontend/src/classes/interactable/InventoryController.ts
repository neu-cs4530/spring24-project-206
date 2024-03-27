import InteractableAreaController, {
  BaseInteractableEventMap,
  INVENTORY_AREA_TYPE,
} from './InteractableAreaController';
import {
  InventoryArea as InventoryAreaModel
} from '../../types/CoveyTownSocket';
import { Pet } from '../../../../townService/src/lib/Pet';
import TownController from '../TownController';

export type InventoryAreaEvents = BaseInteractableEventMap & {
  petChange: (newPets: Pet[] | undefined) => void;
};

export default class InventoryController extends InteractableAreaController<
  InventoryAreaEvents,
  InventoryAreaModel
> {
  private _pets?: Pet[];

  protected _townController: TownController;

  constructor(id: string, townController: TownController, pets?: Pet[]) {
    super(id);
    this._pets = pets;
    this._townController = townController;
  }

  public async equip(type: string) {
    this._pets?.push({ type: type, playerID: this._townController.ourPlayer.id, equipped: true });
    await this._townController.sendInteractableCommand(this.id, {
      type: 'EquipPet',
      petType: type,
      playerID: this._townController.ourPlayer.id,
    });
  }

  set pets(newPets: Pet[] | undefined) {
    if (this._pets !== newPets) {
      this.emit('petInventoryChange', newPets);
    }
    this._pets = newPets;
  }

  get pets(): Pet[] | undefined {
    return this._pets;
  }

  toInteractableAreaModel(): InventoryAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      pets: this.pets,
      type: 'InventoryArea',
    };
  }

  protected _updateFrom(newModel: InventoryAreaModel): void {
    this.pets = newModel.pets;
  }

  public isActive(): boolean {
    return this.pets !== undefined && this.occupants.length > 0;
  }

  public get friendlyName(): string {
    return 'pet inventory ' + ': ' + this.id;
  }

  public get type(): string {
    return INVENTORY_AREA_TYPE;
  }
}
