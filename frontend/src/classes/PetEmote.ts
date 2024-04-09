import Phaser from 'phaser';
import { PlayerID } from '../types/CoveyTownSocket';

export type EmotionGameObjects = {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  locationManagedByGameScene: boolean;
};

export type PetEmote = {
  playerID: PlayerID;
  emotion?: string;
  gameObjects?: EmotionGameObjects;
};
