import InteractableAreaController, {
  BaseInteractableEventMap,
  PET_SHOP_AREA_TYPE,
} from './InteractableAreaController';
import { PetShopArea as PetShopAreaModel } from '../../types/CoveyTownSocket';
import { Pet } from '../../../../townService/src/lib/Pet';
import TownController from '../TownController';

export type PetShopAreaEvents = BaseInteractableEventMap & {
  petChange: (newPets: Pet[] | undefined) => void;
};

export default class PetShopController extends InteractableAreaController<
  PetShopAreaEvents,
  PetShopAreaModel
> {
  private _pets?: Pet[];

  protected _townController: TownController;

  constructor(id: string, townController: TownController, pets?: Pet[]) {
    super(id);
    this._pets = pets;
    this._townController = townController;
  }

  async adopt(type: string) {
    this._pets?.push({ type: type, playerID: this._townController.ourPlayer.id, equipped: true });
    await this._townController.sendInteractableCommand(this.id, {
      type: 'AdoptPet',
      petType: type,
      playerID: this._townController.ourPlayer.id,
    });
  }

  set pets(newPets: Pet[] | undefined) {
    if (this._pets !== newPets) {
      this.emit('petCatalogChange', newPets);
    }
    this._pets = newPets;
  }

  get pets(): Pet[] | undefined {
    return this._pets;
  }

  toInteractableAreaModel(): PetShopAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      pets: this.pets,
      type: 'PetShopArea',
    };
  }

  protected _updateFrom(newModel: PetShopAreaModel): void {
    this.pets = newModel.pets;
  }

  public isActive(): boolean {
    return this.pets !== undefined && this.occupants.length > 0;
  }

  public get friendlyName(): string {
    return 'pet shop ' + ': ' + this.id;
  }

  public get type(): string {
    return PET_SHOP_AREA_TYPE;
  }
}
