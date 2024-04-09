import InteractableAreaController, {
  BaseInteractableEventMap,
  INVENTORY_AREA_TYPE,
} from './InteractableAreaController';
import { EquippedPet, InventoryArea as InventoryAreaModel } from '../../types/CoveyTownSocket';
import { Pet } from '../../../../townService/src/lib/Pet';
import TownController from '../TownController';
import { findPetImgId, findPetSpeed } from '../../../../townService/src/town/Database';
import { PET_BASELINE_OFFSET, PET_OFFSET} from '../PetController';

export type InventoryAreaEvents = BaseInteractableEventMap & {
  petChange: (newPets: Pet[] | undefined) => void;
};

/**
 * This class is responsible for managing the state of the inventory,
 * and for sending commands to the server.
 */
export default class InventoryAreaController extends InteractableAreaController<
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

  /**
   * Sends a command to equip a pet.
   *
   * @param type the type of the pet to equip
   */
  public async equip(type: string) {
    const playerController = this._townController.ourPlayer;
    const playerID = playerController.id;
    const playerLoc = playerController.location;
    switch (playerLoc.rotation) {
      case 'left':
        playerLoc.x += PET_OFFSET;
        break;
      case 'right':
        playerLoc.x -= PET_OFFSET;
        break;
      case 'front':
        playerLoc.y -= PET_OFFSET;
        break;
      case 'back':
        playerLoc.y += PET_OFFSET;
        break;
      default:
        break;
    }
    const imgID = await findPetImgId(type);
    const toBeEquipped: EquippedPet = {
      type,
      playerID,
      location: {
        x: playerLoc.x,
        y: playerLoc.y + PET_BASELINE_OFFSET,
        rotation: playerLoc.rotation,
      },
      imgID,
    };

    const speedFactor = await findPetSpeed(type);
    playerController.multiplySpeedBy(speedFactor);
    await this._townController.sendInteractableCommand(this.id, {
      type: 'EquipPet',
      toBeEquipped,
    });
  }

  /**
   * Sends a command to unequip a pet.
   *
   * @param type the type of the pet to unequip
   */
  public async unequip(type: string) {
    this._townController.ourPlayer.resetSpeed();
    await this._townController.sendInteractableCommand(this.id, {
      type: 'UnequipPet',
      petType: type,
      playerID: this._townController.ourPlayer.id,
    });
  }

  /**
   * Sets array of all pets and emits the change.
   *
   * @param newPets the new pet array to be set to
   */
  set pets(newPets: Pet[] | undefined) {
    if (this._pets !== newPets) {
      this.emit('petChange', newPets);
    }
    this._pets = newPets;
  }

  /**
   * Returns the array of all pets.
   */
  get pets(): Pet[] | undefined {
    return this._pets;
  }

  /**
   * Returns the inventory area controlled by this controller.
   *
   * @return the inventory area
   */
  toInteractableAreaModel(): InventoryAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      pets: this.pets,
      type: 'InventoryArea',
    };
  }

  /**
   * Updates the pets array based on the new model.
   *
   * @param newModel the new model
   */
  protected _updateFrom(newModel: InventoryAreaModel): void {
    this.pets = newModel.pets;
  }

  /**
   * Returns true if the pets array is defined and there are occupants.
   *
   * @returns whether the inventory area is active
   */
  public isActive(): boolean {
    return this.pets !== undefined && this.occupants.length > 0;
  }

  /**
   * Returns the friendly name of the inventory area.
   *
   * @returns the friendly name
   */
  public get friendlyName(): string {
    return 'pet inventory ' + ': ' + this.id;
  }

  /**
   * Returns the type of the inventory area.
   *
   * @returns inventory area type
   */
  public get type(): string {
    return INVENTORY_AREA_TYPE;
  }
}
