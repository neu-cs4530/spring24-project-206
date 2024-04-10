import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { Player as PlayerModel, PlayerLocation } from '../types/CoveyTownSocket';

export const DEFAULT_SPEED = 175;

export type PlayerEvents = {
  movement: (newLocation: PlayerLocation) => void;
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

  private _movementSpeed: number;

  constructor(id: string, userName: string, location: PlayerLocation) {
    super();
    this._id = id;
    this._userName = userName;
    this._location = location;
    this._movementSpeed = DEFAULT_SPEED;
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

  set movementSpeed(newSpeed: number) {
    this._movementSpeed = newSpeed;
  }

  get movementSpeed(): number {
    return this._movementSpeed;
  }

  multiplySpeedBy(factor: number) {
    this.movementSpeed = DEFAULT_SPEED * factor;
  }

  resetSpeed() {
    this.movementSpeed = DEFAULT_SPEED;
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
            sprite.body.setVelocity(0, this.movementSpeed);
            break;
          case 'right':
            sprite.body.setVelocity(this.movementSpeed, 0);
            break;
          case 'back':
            sprite.body.setVelocity(0, -this.movementSpeed);
            break;
          case 'left':
            sprite.body.setVelocity(-this.movementSpeed, 0);
            break;
        }
        sprite.body.velocity.normalize().scale(this.movementSpeed);
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
