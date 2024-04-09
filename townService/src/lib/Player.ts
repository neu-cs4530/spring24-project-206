import { nanoid } from 'nanoid';
import { Player as PlayerModel, PlayerLocation, TownEmitter } from '../types/CoveyTownSocket';

/**
 * Each user who is connected to a town is represented by a Player object
 */
export default class Player {
  /** The current location of this user in the world map * */
  public location: PlayerLocation;

  /** The unique identifier for this player * */
  private readonly _id: string;

  /** The player's username, which is not guaranteed to be unique within the town * */
  private readonly _userName: string;

  /** The secret token that allows this client to access our Covey.Town service for this town * */
  private readonly _sessionToken: string;

  /** The secret token that allows this client to access our video resources for this town * */
  private _videoToken?: string;

  /** A special town emitter that will emit events to the entire town BUT NOT to this player */
  public readonly townEmitter: TownEmitter;

  /** A random emote assigned to the player on creation */
  private readonly _emote: string;

  constructor(userName: string, townEmitter: TownEmitter) {
    this.location = {
      x: 0,
      y: 0,
      moving: false,
      rotation: 'front',
    };
    this._userName = userName;
    this._id = nanoid();
    this._emote = this._randomAnimation();
    this._sessionToken = nanoid();
    this.townEmitter = townEmitter;
  }

  private _randomAnimation() {
    const animations = ['alert', 'disgust', 'happy', 'love', 'sad'];
    const minCeiled = Math.ceil(0);
    const maxFloored = Math.floor(5);
    // The maximum is exclusive and the minimum is inclusive
    const randomIndex = Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);

    return animations.slice(randomIndex)[0];
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  get emote(): string {
    return this._emote;
  }

  set videoToken(value: string | undefined) {
    this._videoToken = value;
  }

  get videoToken(): string | undefined {
    return this._videoToken;
  }

  get sessionToken(): string {
    return this._sessionToken;
  }

  toPlayerModel(): PlayerModel {
    return {
      id: this._id,
      location: this.location,
      userName: this._userName,
      emote: this.emote,
    };
  }
}
