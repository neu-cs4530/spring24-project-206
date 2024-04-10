import Phaser from 'phaser';
import { ActiveEmote, EmoteType, PetLocation, PlayerID } from '../types/CoveyTownSocket';

export type EmoteGameObjects = {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  locationManagedByGameScene: boolean;
};

export class EmoteController {
  private readonly _playerID: PlayerID;

  private readonly _emote: EmoteType;

  private _location: PetLocation;

  public gameObjects?: EmoteGameObjects;

  constructor(playerID: PlayerID, location: PetLocation, emote?: EmoteType) {
    this._playerID = playerID;
    this._emote = emote ?? this._randomEmote();
    this._location = location;
  }

  public get location(): PetLocation {
    return this._location;
  }

  public set location(value: PetLocation) {
    this._location = value;
  }

  public get playerID(): PlayerID {
    return this._playerID;
  }

  public get emote(): EmoteType {
    return this._emote;
  }

  toActiveEmote(): ActiveEmote {
    return { emote: this.emote, playerID: this.playerID, location: this.location };
  }

  private _randomEmote(): EmoteType {
    const animations: EmoteType[] = ['alert', 'disgust', 'happy', 'love', 'sad'];
    const minCeiled = Math.ceil(0);
    const maxFloored = Math.floor(5);
    // The maximum is exclusive and the minimum is inclusive
    const randomIndex = Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);

    return animations.slice(randomIndex)[0];
  }

  static fromActiveEmote(emote: ActiveEmote): EmoteController {
    return new EmoteController(emote.playerID, emote.location, emote.emote);
  }
}
