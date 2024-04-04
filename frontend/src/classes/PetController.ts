import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import {
  EquippedPet as PetModel,
  PetLocation,
  PlayerID,
} from '../../../shared/types/CoveyTownSocket';

export type PetEvents = {
  petMovement: (newLocation: PetLocation) => void;
};

export type PetGameObjects = {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  label: Phaser.GameObjects.Text;
  locationManagedByGameScene: boolean;
};

export default class PetController extends (EventEmitter as new () => TypedEmitter<PetEvents>) {
  private _location: PetLocation;

  private readonly _type: string;

  private readonly _playerID: PlayerID;

  private readonly _imgID: number;

  public gameObjects?: PetGameObjects;

  constructor(type: string, playerID: PlayerID, location: PetLocation, imgID: number) {
    super();
    this._type = type;
    this._playerID = playerID;
    this._location = location;
    this._imgID = imgID;
  }

  set location(newLocation: PetLocation) {
    this._location = newLocation;
    this._updateGameComponentLocation();
    this.emit('petMovement', newLocation);
  }

  get location(): PetLocation {
    return this._location;
  }

  get type(): string {
    return this._type;
  }

  get playerID(): PlayerID {
    return this._playerID;
  }

  get imgID(): number {
    return this._imgID;
  }

  toPetModel(): PetModel {
    return { type: this.type, playerID: this.playerID, location: this.location };
  }

  private _updateGameComponentLocation() {
    if (this.gameObjects && !this.gameObjects.locationManagedByGameScene) {
      const { sprite, label } = this.gameObjects;
      sprite.setX(this.location.x);
      sprite.setY(this.location.y);
    }
  }

  static fromPetModel(modelPet: PetModel): PetController {
    return new PetController(modelPet.type, modelPet.playerID, modelPet.location, modelPet.imgID);
  }
}
