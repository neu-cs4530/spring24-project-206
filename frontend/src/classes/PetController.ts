import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import {
  EquippedPet as PetModel,
  PetLocation,
  PlayerID,
} from '../../../shared/types/CoveyTownSocket';

// Define the events that the PetController can emit
export type PetEvents = {
  petMovement: (newLocation: PetLocation) => void;
};

// Define the game objects associated with the pet
export type PetGameObjects = {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  label: Phaser.GameObjects.Text;
  locationManagedByGameScene: boolean;
};

export default class PetController extends (EventEmitter as new () => TypedEmitter<PetEvents>) {
  private _location: PetLocation; // Current location of the pet

  private readonly _type: string; // Type of the pet

  private readonly _playerID: PlayerID; // ID of the player who owns the pet

  private readonly _imgID: number; // ID of the pet's image

  public gameObjects?: PetGameObjects; // Game objects associated with the pet

  constructor(type: string, playerID: PlayerID, location: PetLocation, imgID: number) {
    super();
    this._type = type;
    this._playerID = playerID;
    this._location = location;
    this._imgID = imgID;
  }

  // Setter for updating the pet's location
  set location(newLocation: PetLocation) {
    this._location = newLocation;
    // Update the game component's location
    this._updateGameComponentLocation();
    // Emit an event indicating the pet's movement
    this.emit('petMovement', newLocation);
  }

  // Getter for retrieving the pet's location
  get location(): PetLocation {
    return this._location;
  }

  // Getter for retrieving the pet's type
  get type(): string {
    return this._type;
  }

  // Getter for retrieving the player ID of the pet's owner
  get playerID(): PlayerID {
    return this._playerID;
  }

  // Getter for retrieving the image ID of the pet
  get imgID(): number {
    return this._imgID;
  }

  // Convert the PetController instance to a PetModel
  toPetModel(): PetModel {
    return { type: this.type, playerID: this.playerID, location: this.location, imgID: this.imgID };
  }

  // Update the location of the pet
  private _updateGameComponentLocation() {
    if (this.gameObjects && !this.gameObjects.locationManagedByGameScene) {
      const { sprite, label } = this.gameObjects;
      // Update sprite's position
      sprite.setX(this.location.x);
      sprite.setY(this.location.y);

      label.setX(sprite.body.x);
      label.setY(sprite.body.y - 20);
    }
  }

  // Static method to create a PetController instance from a PetModel
  static fromPetModel(modelPet: PetModel): PetController {
    return new PetController(modelPet.type, modelPet.playerID, modelPet.location, modelPet.imgID);
  }
}
