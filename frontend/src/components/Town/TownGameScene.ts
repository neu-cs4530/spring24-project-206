import assert from 'assert';
import Phaser from 'phaser';
import PlayerController from '../../classes/PlayerController';
import TownController from '../../classes/TownController';
import { PlayerID, PetLocation, PlayerLocation } from '../../types/CoveyTownSocket';
import { Callback } from '../VideoCall/VideoFrontend/types';
import Interactable from './Interactable';
import ConversationArea from './interactables/ConversationArea';
import GameArea from './interactables/GameArea';
import Inventory from './interactables/PetShop/Inventory';
import PetShop from './interactables/PetShop/PetShop';
import Transporter from './interactables/Transporter';
import ViewingArea from './interactables/ViewingArea';
import PetController, {
  PET_BASELINE_OFFSET,
  PET_LABEL_X_OFFSET,
  PET_LABEL_Y_OFFSET,
  PET_OFFSET,
} from '../../classes/PetController';
import { EmoteController } from '../../classes/EmoteController';

// prefix of pet sprite keys
const PET_SPRITE_PREFIX = 'Pet_Sprite_';
// prefix of pet emotes
const PET_EMOTE_PREFIX = 'Pet_Emote_';

// Still not sure what the right type is here... "Interactable" doesn't do it
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function interactableTypeForObjectType(type: string): any {
  if (type === 'ConversationArea') {
    return ConversationArea;
  } else if (type === 'Transporter') {
    return Transporter;
  } else if (type === 'ViewingArea') {
    return ViewingArea;
  } else if (type === 'GameArea') {
    return GameArea;
  } else if (type == 'PetShopArea') {
    return PetShop;
  } else if (type == 'InventoryArea') {
    return Inventory;
  } else {
    throw new Error(`Unknown object type: ${type}`);
  }
}

// Original inspiration and code from:
// https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
export default class TownGameScene extends Phaser.Scene {
  private _pendingOverlapExits = new Map<Interactable, () => void>();

  addOverlapExit(interactable: Interactable, callback: () => void) {
    this._pendingOverlapExits.set(interactable, callback);
  }

  private _players: PlayerController[] = [];

  private _pets: PetController[] = [];

  private _emotes: EmoteController[] = [];

  private _interactables: Interactable[] = [];

  private _cursors: Phaser.Types.Input.Keyboard.CursorKeys[] = [];

  private _cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;

  /*
   * A "captured" key doesn't send events to the browser - they are trapped by Phaser
   * When pausing the game, we uncapture all keys, and when resuming, we re-capture them.
   * This is the list of keys that are currently captured by Phaser.
   */
  private _previouslyCapturedKeys: number[] = [];

  private _lastLocation?: PlayerLocation;

  private _ready = false;

  private _paused = false;

  public coveyTownController: TownController;

  private _onGameReadyListeners: Callback[] = [];

  /**
   * Layers that the player can collide with.
   */
  private _collidingLayers: Phaser.Tilemaps.TilemapLayer[] = [];

  private _gameIsReady = new Promise<void>(resolve => {
    if (this._ready) {
      resolve();
    } else {
      this._onGameReadyListeners.push(resolve);
    }
  });

  public get gameIsReady() {
    return this._gameIsReady;
  }

  public get cursorKeys() {
    const ret = this._cursorKeys;
    if (!ret) {
      throw new Error('Unable to access cursors before game scene is loaded');
    }
    return ret;
  }

  private _resourcePathPrefix: string;

  constructor(coveyTownController: TownController, resourcePathPrefix = '') {
    super('TownGameScene');
    this._resourcePathPrefix = resourcePathPrefix;
    this.coveyTownController = coveyTownController;
    this._players = this.coveyTownController.players;
    this._pets = this.coveyTownController.pets;
  }

  preload() {
    this.load.image(
      'Room_Builder_32x32',
      this._resourcePathPrefix + '/assets/tilesets/Room_Builder_32x32.png',
    );
    this.load.image(
      '22_Museum_32x32',
      this._resourcePathPrefix + '/assets/tilesets/22_Museum_32x32.png',
    );
    this.load.image(
      '5_Classroom_and_library_32x32',
      this._resourcePathPrefix + '/assets/tilesets/5_Classroom_and_library_32x32.png',
    );
    this.load.image(
      '12_Kitchen_32x32',
      this._resourcePathPrefix + '/assets/tilesets/12_Kitchen_32x32.png',
    );
    this.load.image(
      '1_Generic_32x32',
      this._resourcePathPrefix + '/assets/tilesets/1_Generic_32x32.png',
    );
    this.load.image(
      '13_Conference_Hall_32x32',
      this._resourcePathPrefix + '/assets/tilesets/13_Conference_Hall_32x32.png',
    );
    this.load.image(
      '14_Basement_32x32',
      this._resourcePathPrefix + '/assets/tilesets/14_Basement_32x32.png',
    );
    this.load.image(
      '16_Grocery_store_32x32',
      this._resourcePathPrefix + '/assets/tilesets/16_Grocery_store_32x32.png',
    );
    this.load.tilemapTiledJSON('map', this._resourcePathPrefix + '/assets/tilemaps/indoors.json');
    this.load.atlas(
      'atlas',
      this._resourcePathPrefix + '/assets/atlas/atlas.png',
      this._resourcePathPrefix + '/assets/atlas/atlas.json',
    );
    // loading pet sprites
    this.load.image(
      PET_SPRITE_PREFIX + 1,
      this._resourcePathPrefix + '/assets/pet-shop/pet-sprites/1.png',
    );
    this.load.image(
      PET_SPRITE_PREFIX + 2,
      this._resourcePathPrefix + '/assets/pet-shop/pet-sprites/2.png',
    );
    this.load.image(
      PET_SPRITE_PREFIX + 3,
      this._resourcePathPrefix + '/assets/pet-shop/pet-sprites/3.png',
    );
    this.load.image(
      PET_SPRITE_PREFIX + 4,
      this._resourcePathPrefix + '/assets/pet-shop/pet-sprites/4.png',
    );
    this.load.image(
      PET_SPRITE_PREFIX + 5,
      this._resourcePathPrefix + '/assets/pet-shop/pet-sprites/5.png',
    );
    this.load.image(
      PET_SPRITE_PREFIX + 6,
      this._resourcePathPrefix + '/assets/pet-shop/pet-sprites/6.png',
    );
    this.load.image(
      PET_SPRITE_PREFIX + 7,
      this._resourcePathPrefix + '/assets/pet-shop/pet-sprites/7.png',
    );
    this.load.image(
      PET_SPRITE_PREFIX + 8,
      this._resourcePathPrefix + '/assets/pet-shop/pet-sprites/8.png',
    );
    this.load.image(
      PET_SPRITE_PREFIX + 9,
      this._resourcePathPrefix + '/assets/pet-shop/pet-sprites/9.png',
    );
    this.load.image(
      PET_SPRITE_PREFIX + 10,
      this._resourcePathPrefix + '/assets/pet-shop/pet-sprites/10.png',
    );
    this.load.image(
      PET_SPRITE_PREFIX + 11,
      this._resourcePathPrefix + '/assets/pet-shop/pet-sprites/11.png',
    );
    this.load.image(
      PET_SPRITE_PREFIX + 12,
      this._resourcePathPrefix + '/assets/pet-shop/pet-sprites/12.png',
    );
    // loading emotes
    this.load.image(
      PET_EMOTE_PREFIX + 'alert',
      this._resourcePathPrefix + '/assets/pet-shop/emotes/alert.png',
    );
    this.load.image(
      PET_EMOTE_PREFIX + 'disgust',
      this._resourcePathPrefix + '/assets/pet-shop/emotes/disgust.png',
    );
    this.load.image(
      PET_EMOTE_PREFIX + 'happy',
      this._resourcePathPrefix + '/assets/pet-shop/emotes/happy.png',
    );
    this.load.image(
      PET_EMOTE_PREFIX + 'love',
      this._resourcePathPrefix + '/assets/pet-shop/emotes/love.png',
    );
    this.load.image(
      PET_EMOTE_PREFIX + 'sad',
      this._resourcePathPrefix + '/assets/pet-shop/emotes/sad.png',
    );
  }

  /**
   * Make sure each player in the list has sprites and disconnected players are filtered out of the local list
   * @param players the new list of players
   */
  updatePlayers(players: PlayerController[]) {
    // Make sure that each player has sprites
    players.map(eachPlayer => {
      this.createPlayerSprites(eachPlayer);
    });

    // Remove disconnected players from board
    const disconnectedPlayers = this._players.filter(
      player => !players.find(p => p.id === player.id),
    );

    disconnectedPlayers.forEach(disconnectedPlayer => {
      if (disconnectedPlayer.gameObjects) {
        const { sprite, label } = disconnectedPlayer.gameObjects;
        if (sprite && label) {
          sprite.destroy();
          label.destroy();
        }

        // Remove the pets of the disconnected players from the board
        const equippedPets = this._pets.filter(pet => pet.playerID === disconnectedPlayer.id);
        equippedPets.forEach(equippedPet => this.deletePetSprite(equippedPet));
        this._pets = this._pets.filter(pet => pet.playerID !== disconnectedPlayer.id);
      }
    });
    // Remove disconnected players from list
    this._players = players;
  }

  /**
   * Make sure each pet in the list has sprites and unequipped pets are filtered out of the local list
   * @param pets the new list of pets
   */
  updatePets(pets: PetController[]) {
    // Make sure each pet has a sprite
    pets.forEach(pet => this.createPetSprite(pet));

    // Find unequipped pets by comparing local list to new list
    const unequippedPets = this._pets.filter(
      pet => !pets.find(p => p.playerID === pet.playerID && p.type === pet.type),
    );

    // Remove unequipped pets from the board
    unequippedPets.forEach(unequippedPet => this.deletePetSprite(unequippedPet));

    // Remove unequipped pets from the local list
    this._pets = pets;
  }

  /**
   * Make sure each emote in the list has sprites and old emotes are filtered out of the local list
   * @param emotes the new list of emotes
   */
  updateEmotes(emotes: EmoteController[]) {
    emotes.forEach(emote => this.createEmote(emote));

    // remove old emotes from the board
    const oldEmotes = this._emotes.filter(
      emote => !emotes.find(e => e.playerID === emote.playerID),
    );

    oldEmotes.forEach(e => this.deleteEmote(e));

    // Remove old emotes from list
    this._emotes = emotes;
  }

  /**
   * Create the sprite for the emote
   * @param emote the emote to be added as a sprite
   */
  createEmote(emote: EmoteController) {
    if (!emote.gameObjects) {
      const imgKey = PET_EMOTE_PREFIX + emote.emote;
      const sprite = this.physics.add
        .sprite(emote.location.x - 10, emote.location.y - 20, imgKey)
        .setSize(30, 40)
        .setOffset(0, 24);
      this._collidingLayers.forEach(layer => this.physics.add.collider(sprite, layer));
      emote.gameObjects = {
        sprite,
        locationManagedByGameScene: false,
      };

      // set a timer on the sprite to disappear after 2 seconds
      setTimeout(() => {
        this.deleteEmote(emote);
        this.coveyTownController.emitEmoteDestruction(emote);
      }, 2000);
    }
  }

  /**
   * Delete an emote sprite
   * @param emote the emote that has to be removed
   */
  deleteEmote(emote: EmoteController) {
    if (emote.gameObjects) {
      const { sprite } = emote.gameObjects;
      if (sprite) {
        sprite.destroy();
      }
    }
  }

  getNewMovementDirection() {
    if (this._cursors.find(keySet => keySet.left?.isDown)) {
      return 'left';
    }
    if (this._cursors.find(keySet => keySet.right?.isDown)) {
      return 'right';
    }
    if (this._cursors.find(keySet => keySet.down?.isDown)) {
      return 'front';
    }
    if (this._cursors.find(keySet => keySet.up?.isDown)) {
      return 'back';
    }
    return undefined;
  }

  moveOurPlayerTo(destination: Partial<PlayerLocation>) {
    const gameObjects = this.coveyTownController.ourPlayer.gameObjects;
    if (!gameObjects) {
      throw new Error('Unable to move player without game objects created first');
    }
    if (!this._lastLocation) {
      this._lastLocation = { moving: false, rotation: 'front', x: 0, y: 0 };
    }
    if (destination.x !== undefined) {
      gameObjects.sprite.x = destination.x;
      this._lastLocation.x = destination.x;
    }
    if (destination.y !== undefined) {
      gameObjects.sprite.y = destination.y;
      this._lastLocation.y = destination.y;
    }
    if (destination.moving !== undefined) {
      this._lastLocation.moving = destination.moving;
    }
    if (destination.rotation !== undefined) {
      this._lastLocation.rotation = destination.rotation;
    }
    this.coveyTownController.emitMovement(this._lastLocation);

    // also update pet locations
    this.moveOurPets();
  }

  update() {
    if (this._paused) {
      return;
    }
    const gameObjects = this.coveyTownController.ourPlayer.gameObjects;
    if (gameObjects && this._cursors) {
      const prevVelocity = gameObjects.sprite.body.velocity.clone();
      const body = gameObjects.sprite.body as Phaser.Physics.Arcade.Body;

      // Stop any previous movement from the last frame
      body.setVelocity(0);

      const primaryDirection = this.getNewMovementDirection();
      switch (primaryDirection) {
        case 'left':
          body.setVelocityX(-this.coveyTownController.ourPlayer.movementSpeed);
          gameObjects.sprite.anims.play('misa-left-walk', true);
          break;
        case 'right':
          body.setVelocityX(this.coveyTownController.ourPlayer.movementSpeed);
          gameObjects.sprite.anims.play('misa-right-walk', true);
          break;
        case 'front':
          body.setVelocityY(this.coveyTownController.ourPlayer.movementSpeed);
          gameObjects.sprite.anims.play('misa-front-walk', true);
          break;
        case 'back':
          body.setVelocityY(-this.coveyTownController.ourPlayer.movementSpeed);
          gameObjects.sprite.anims.play('misa-back-walk', true);
          break;
        default:
          // Not moving
          gameObjects.sprite.anims.stop();
          // If we were moving, pick and idle frame to use
          if (prevVelocity.x < 0) {
            gameObjects.sprite.setTexture('atlas', 'misa-left');
          } else if (prevVelocity.x > 0) {
            gameObjects.sprite.setTexture('atlas', 'misa-right');
          } else if (prevVelocity.y < 0) {
            gameObjects.sprite.setTexture('atlas', 'misa-back');
          } else if (prevVelocity.y > 0) gameObjects.sprite.setTexture('atlas', 'misa-front');
          break;
      }

      // Normalize and scale the velocity so that player can't move faster along a diagonal
      gameObjects.sprite.body.velocity
        .normalize()
        .scale(this.coveyTownController.ourPlayer.movementSpeed);

      const isMoving = primaryDirection !== undefined;
      gameObjects.label.setX(body.x);
      gameObjects.label.setY(body.y - 20);
      const x = gameObjects.sprite.getBounds().centerX;
      const y = gameObjects.sprite.getBounds().centerY;
      //Move the sprite
      if (
        !this._lastLocation ||
        (isMoving && this._lastLocation.rotation !== primaryDirection) ||
        this._lastLocation.moving !== isMoving
      ) {
        if (!this._lastLocation) {
          this._lastLocation = {
            x,
            y,
            rotation: primaryDirection || 'front',
            moving: isMoving,
          };
        }
        this._lastLocation.x = x;
        this._lastLocation.y = y;
        this._lastLocation.rotation = primaryDirection || this._lastLocation.rotation || 'front';
        this._lastLocation.moving = isMoving;
        this._pendingOverlapExits.forEach((cb, interactable) => {
          if (
            !Phaser.Geom.Rectangle.Overlaps(
              interactable.getBounds(),
              gameObjects.sprite.getBounds(),
            )
          ) {
            this._pendingOverlapExits.delete(interactable);
            cb();
          }
        });
        this.coveyTownController.emitMovement(this._lastLocation);

        // Also update pet locations
        this.moveOurPets();
      }

      //Update the location for the labels of all of the other players
      for (const player of this._players) {
        if (player.gameObjects?.label && player.gameObjects?.sprite.body) {
          player.gameObjects.label.setX(player.gameObjects.sprite.body.x);
          player.gameObjects.label.setY(player.gameObjects.sprite.body.y - 20);
        }
      }
    }
  }

  /**
   * Moves all of our pets to our current location
   */
  moveOurPets() {
    const ourPets = this._pets.filter(
      pet => pet.playerID === this.coveyTownController.ourPlayer.id,
    );
    const newLocation = this.coveyTownController.ourPlayer.location;
    ourPets.forEach(pet => {
      // Offsets the location so that the pet will be behind the player
      switch (newLocation.rotation) {
        case 'left':
          newLocation.x += PET_OFFSET;
          break;
        case 'right':
          newLocation.x -= PET_OFFSET;
          break;
        case 'front':
          newLocation.y -= PET_OFFSET;
          break;
        case 'back':
          newLocation.y += PET_OFFSET;
          break;
        default:
          break;
      }
      this.movePetTo(pet, {
        x: newLocation.x,
        // offsets so that pet will be on the same baseline as player
        y: newLocation.y + PET_BASELINE_OFFSET,
        rotation: newLocation.rotation,
      });
    });
  }

  /**
   * Moves the given pet to the destination
   * @param pet pet to move
   * @param destination desired destination
   */
  movePetTo(pet: PetController, destination: PetLocation) {
    const gameObjects = pet.gameObjects;
    if (!gameObjects) {
      throw new Error('Unable to move pet without game objects created first');
    }
    if (destination.x !== undefined) {
      gameObjects.sprite.x = destination.x;
    }
    if (destination.y !== undefined) {
      gameObjects.sprite.y = destination.y;
    }

    gameObjects.label.setX(destination.x - PET_LABEL_X_OFFSET);
    gameObjects.label.setY(destination.x - PET_LABEL_Y_OFFSET);

    switch (destination.rotation) {
      case 'left':
        gameObjects.sprite.flipX = true;
        break;
      default:
        gameObjects.sprite.flipX = false;
        break;
    }

    this.coveyTownController.emitPetMovement(pet, destination);
  }

  private _map?: Phaser.Tilemaps.Tilemap;

  public get map(): Phaser.Tilemaps.Tilemap {
    const map = this._map;
    if (!map) {
      throw new Error('Cannot access map before it is initialized');
    }
    return map;
  }

  getInteractables(): Interactable[] {
    const typedObjects = this.map.filterObjects('Objects', obj => obj.type !== '');
    assert(typedObjects);
    const gameObjects = this.map.createFromObjects(
      'Objects',
      typedObjects.map(obj => ({
        id: obj.id,
        classType: interactableTypeForObjectType(obj.type),
      })),
    );

    return gameObjects as Interactable[];
  }

  create() {
    this._map = this.make.tilemap({ key: 'map' });

    /* Parameters are the name you gave the tileset in Tiled and then the key of the
         tileset image in Phaser's cache (i.e. the name you used in preload)
         */
    const tileset = [
      'Room_Builder_32x32',
      '22_Museum_32x32',
      '5_Classroom_and_library_32x32',
      '12_Kitchen_32x32',
      '1_Generic_32x32',
      '13_Conference_Hall_32x32',
      '14_Basement_32x32',
      '16_Grocery_store_32x32',
    ].map(v => {
      const ret = this.map.addTilesetImage(v);
      assert(ret);
      return ret;
    });

    this._collidingLayers = [];
    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = this.map.createLayer('Below Player', tileset, 0, 0);
    assert(belowLayer);
    belowLayer.setDepth(-10);
    const wallsLayer = this.map.createLayer('Walls', tileset, 0, 0);
    const onTheWallsLayer = this.map.createLayer('On The Walls', tileset, 0, 0);
    assert(wallsLayer);
    assert(onTheWallsLayer);
    wallsLayer.setCollisionByProperty({ collides: true });
    onTheWallsLayer.setCollisionByProperty({ collides: true });

    const worldLayer = this.map.createLayer('World', tileset, 0, 0);
    assert(worldLayer);
    worldLayer.setCollisionByProperty({ collides: true });
    const aboveLayer = this.map.createLayer('Above Player', tileset, 0, 0);
    assert(aboveLayer);
    aboveLayer.setCollisionByProperty({ collides: true });

    const veryAboveLayer = this.map.createLayer('Very Above Player', tileset, 0, 0);
    assert(veryAboveLayer);
    /* By default, everything gets depth sorted on the screen in the order we created things.
         Here, we want the "Above Player" layer to sit on top of the player, so we explicitly give
         it a depth. Higher depths will sit on top of lower depth objects.
         */
    worldLayer.setDepth(5);
    aboveLayer.setDepth(10);
    veryAboveLayer.setDepth(15);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    const spawnPoint = this.map.findObject(
      'Objects',
      obj => obj.name === 'Spawn Point',
    ) as unknown as Phaser.GameObjects.Components.Transform;

    const labels = this.map.filterObjects('Objects', obj => obj.name === 'label');
    labels?.forEach(label => {
      if (label.x && label.y) {
        this.add.text(label.x, label.y, label.text.text, {
          color: '#FFFFFF',
          backgroundColor: '#000000',
        });
      }
    });
    assert(this.input.keyboard);
    this._cursorKeys = this.input.keyboard.createCursorKeys();
    this._cursors.push(this._cursorKeys);
    this._cursors.push(
      this.input.keyboard.addKeys(
        {
          up: Phaser.Input.Keyboard.KeyCodes.W,
          down: Phaser.Input.Keyboard.KeyCodes.S,
          left: Phaser.Input.Keyboard.KeyCodes.A,
          right: Phaser.Input.Keyboard.KeyCodes.D,
        },
        false,
      ) as Phaser.Types.Input.Keyboard.CursorKeys,
    );
    this._cursors.push(
      this.input.keyboard.addKeys(
        {
          up: Phaser.Input.Keyboard.KeyCodes.H,
          down: Phaser.Input.Keyboard.KeyCodes.J,
          left: Phaser.Input.Keyboard.KeyCodes.K,
          right: Phaser.Input.Keyboard.KeyCodes.L,
        },
        false,
      ) as Phaser.Types.Input.Keyboard.CursorKeys,
    );

    // Create a sprite with physics enabled via the physics system. The image used for the sprite
    // has a bit of whitespace, so I'm using setSize & setOffset to control the size of the
    // player's body.
    const sprite = this.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, 'atlas', 'misa-front')
      .setSize(30, 40)
      .setOffset(0, 24)
      .setDepth(6);
    const label = this.add
      .text(spawnPoint.x, spawnPoint.y - 20, '(You)', {
        font: '18px monospace',
        color: '#000000',
        backgroundColor: '#ffffff',
      })
      .setDepth(6);
    this.coveyTownController.ourPlayer.gameObjects = {
      sprite,
      label,
      locationManagedByGameScene: true,
    };

    this._interactables = this.getInteractables();

    this.moveOurPlayerTo({ rotation: 'front', moving: false, x: spawnPoint.x, y: spawnPoint.y });

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    this._collidingLayers.push(worldLayer);
    this._collidingLayers.push(wallsLayer);
    this._collidingLayers.push(aboveLayer);
    this._collidingLayers.push(onTheWallsLayer);
    this._collidingLayers.forEach(layer => this.physics.add.collider(sprite, layer));

    // Create the player's walking animations from the texture atlas. These are stored in the global
    // animation manager so any sprite can access them.
    const { anims } = this;
    anims.create({
      key: 'misa-left-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-left-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-right-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-right-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-front-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-front-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-back-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-back-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    const camera = this.cameras.main;
    camera.startFollow(this.coveyTownController.ourPlayer.gameObjects.sprite);
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, `Arrow keys to move`, {
        font: '18px monospace',
        color: '#000000',
        padding: {
          x: 20,
          y: 10,
        },
        backgroundColor: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(30);

    this._ready = true;
    this.updatePlayers(this.coveyTownController.players);
    this.updatePets(this.coveyTownController.pets);
    this.updateEmotes(this.coveyTownController.emotes);
    // Call any listeners that are waiting for the game to be initialized
    this._onGameReadyListeners.forEach(listener => listener());
    this._onGameReadyListeners = [];
    this.coveyTownController.addListener('playersChanged', players => this.updatePlayers(players));
    this.coveyTownController.addListener('equippedPetsChanged', pets => this.updatePets(pets));
    this.coveyTownController.addListener('emotesChanged', emotes => this.updateEmotes(emotes));
  }

  createPlayerSprites(player: PlayerController) {
    if (!player.gameObjects) {
      const sprite = this.physics.add
        .sprite(player.location.x, player.location.y, 'atlas', 'misa-front')
        .setSize(30, 40)
        .setOffset(0, 24);
      const label = this.add.text(
        player.location.x,
        player.location.y - 20,
        player === this.coveyTownController.ourPlayer ? '(You)' : player.userName,
        {
          font: '18px monospace',
          color: '#000000',
          backgroundColor: '#ffffff',
        },
      );
      player.gameObjects = {
        sprite,
        label,
        locationManagedByGameScene: false,
      };
      this._collidingLayers.forEach(layer => this.physics.add.collider(sprite, layer));
    }
  }

  /**
   * Creates a sprite for the given pet if it doesn't already have one
   * @param pet
   */
  createPetSprite(pet: PetController) {
    if (!pet.gameObjects) {
      const imgKey = PET_SPRITE_PREFIX + pet.imgID;
      const sprite = this.physics.add
        .sprite(pet.location.x, pet.location.y, imgKey)
        .setSize(30, 40)
        .setOffset(0, 24)
        .setInteractive()
        .on('pointerdown', () => this.onClickSprite(pet.playerID, pet.location));
      const label = this.add.text(
        pet.location.x - PET_LABEL_X_OFFSET,
        pet.location.y - PET_LABEL_Y_OFFSET,
        pet.type,
        {
          font: '10px monospace',
          color: '#000000',
          backgroundColor: '#ffffff',
        },
      );
      pet.gameObjects = {
        sprite,
        label,
        locationManagedByGameScene: false,
      };
      this._collidingLayers.forEach(layer => this.physics.add.collider(sprite, layer));
    }
  }

  /**
   * Randomise a new emote every time the user clicks on the pet
   * @param petPlayerID the pet/player the emote is associated with
   * @param location where the pet is located
   */
  onClickSprite(petPlayerID: PlayerID, location: PetLocation) {
    const newEmote = new EmoteController(petPlayerID, location);
    this._emotes.push(newEmote);
    this.createEmote(newEmote);
    this.coveyTownController.emitEmoteCreation(newEmote);
  }

  /**
   * Deletes the sprites of the given pet
   * @param pet
   */
  deletePetSprite(pet: PetController) {
    if (pet.gameObjects) {
      const { sprite, label } = pet.gameObjects;
      if (sprite && label) {
        sprite.destroy();
        label.destroy();
      }

      // also delete all its associated emotes
      const emotesToDelete = this._emotes.filter(emote => emote.playerID === pet.playerID);
      console.log(`emotes to delete = `);
      console.log(emotesToDelete);
      if (emotesToDelete.length > 0) {
        emotesToDelete.forEach(e => this.deleteEmote(e));
      }
    }
  }

  pause() {
    if (!this._paused) {
      this._paused = true;
      const gameObjects = this.coveyTownController.ourPlayer.gameObjects;
      if (gameObjects) {
        gameObjects.sprite.anims.stop();
        const body = gameObjects.sprite.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0);
      }
      assert(this.input.keyboard);
      this._previouslyCapturedKeys = this.input.keyboard.getCaptures();
      this.input.keyboard.clearCaptures();
    }
  }

  resume() {
    if (this._paused) {
      this._paused = false;
      if (this.input && this.input.keyboard) {
        this.input.keyboard.addCapture(this._previouslyCapturedKeys);
      }
      this._previouslyCapturedKeys = [];
    }
  }
}
