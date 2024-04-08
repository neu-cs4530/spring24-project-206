import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { EquippedPetUpdate, Player as PlayerModel, PlayerLocation } from '../types/CoveyTownSocket';
import PetController from './PetController';

export const DEFAULT_SPEED = 175;

export type PlayerEvents = {
  movement: (newLocation: PlayerLocation) => void;
  equippedPetChanged: (update: EquippedPetUpdate) => void;
};

export type PlayerGameObjects = {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  label: Phaser.GameObjects.Text;
  locationManagedByGameScene: boolean /* For the local player, the game scene will calculate the current location, and we should NOT apply updates when we receive events */;
};
export default class PlayerController extends (EventEmitter as new () => TypedEmitter<PlayerEvents>) {
  private _location: PlayerLocation;

  private readonly _id: string;

  private readonly _userName: string;

  public gameObjects?: PlayerGameObjects;

  private _equippedPet?: PetController;

  // private _movementSpeed: number;

  constructor(id: string, userName: string, location: PlayerLocation) {
    super();
    this._id = id;
    this._userName = userName;
    this._location = location;
    // this.resetSpeed();
  }

  set location(newLocation: PlayerLocation) {
    this._location = newLocation;
    this._updateGameComponentLocation();
    this.emit('movement', newLocation);
  }

  get location(): PlayerLocation {
    return this._location;
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  set equippedPet(newPet: PetController | undefined) {
    this.emit('equippedPetChanged', { toBeUnequipped: this._equippedPet, toBeEquipped: newPet });
    this._equippedPet = newPet;
  }

  get equippedPet(): PetController | undefined {
    return this._equippedPet;
  }

  toPlayerModel(): PlayerModel {
    return { id: this.id, userName: this.userName, location: this.location };
  }

  private _updateGameComponentLocation() {
    if (this.gameObjects && !this.gameObjects.locationManagedByGameScene) {
      const { sprite, label } = this.gameObjects;
      if (!sprite.anims) return;
      sprite.setX(this.location.x);
      sprite.setY(this.location.y);
      if (this.location.moving) {
        sprite.anims.play(`misa-${this.location.rotation}-walk`, true);
        switch (this.location.rotation) {
          case 'front':
            sprite.body.setVelocity(0, DEFAULT_SPEED);
            break;
          case 'right':
            sprite.body.setVelocity(DEFAULT_SPEED, 0);
            break;
          case 'back':
            sprite.body.setVelocity(0, -DEFAULT_SPEED);
            break;
          case 'left':
            sprite.body.setVelocity(-DEFAULT_SPEED, 0);
            break;
        }
        sprite.body.velocity.normalize().scale(175);
      } else {
        sprite.body.setVelocity(0, 0);
        sprite.anims.stop();
        sprite.setTexture('atlas', `misa-${this.location.rotation}`);
      }
      label.setX(sprite.body.x);
      label.setY(sprite.body.y - 20);
    }
  }

  static fromPlayerModel(modelPlayer: PlayerModel): PlayerController {
    return new PlayerController(modelPlayer.id, modelPlayer.userName, modelPlayer.location);
  }
}
