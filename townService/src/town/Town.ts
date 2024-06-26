import { ITiledMap, ITiledMapObjectLayer } from '@jonbell/tiled-map-type-guard';
import { nanoid } from 'nanoid';
import { BroadcastOperator } from 'socket.io';
import {
  addPlayerCurrencyToDao,
  updateOnePlayerCurrencyInDao,
} from '../leaderboard/leaderboard-dao';
import InvalidParametersError from '../lib/InvalidParametersError';
import IVideoClient from '../lib/IVideoClient';
import Player from '../lib/Player';
import TwilioVideo from '../lib/TwilioVideo';
import { isViewingArea } from '../TestUtils';
import {
  ChatMessage,
  ConversationArea as ConversationAreaModel,
  PetShopArea as PetShopAreaModel,
  CoveyTownSocket,
  CurrencyMap,
  EquippedPet,
  Interactable,
  InteractableCommand,
  InteractableCommandBase,
  PetLocation,
  PlayerID,
  ActiveEmote,
  PlayerLocation,
  ServerToClientEvents,
  SocketData,
  ViewingArea as ViewingAreaModel,
} from '../types/CoveyTownSocket';
import { logError } from '../Utils';
import ConversationArea from './ConversationArea';
import { findOnePlayerCurrencyFromDatabase } from '../Database';
// eslint-disable-next-line import/no-cycle
import GameAreaFactory from './games/GameAreaFactory';
import TicTacToeGameArea from './games/TicTacToeGameArea';
import InteractableArea from './InteractableArea';
import PetShopArea from './PetShopArea';
import ViewingArea from './ViewingArea';
import InventoryArea from './InventoryArea';
import ConnectFourGameArea from './games/ConnectFourGameArea';

/**
 * The Town class implements the logic for each town: managing the various events that
 * can occur (e.g. joining a town, moving, leaving a town)
 */
export default class Town {
  get capacity(): number {
    return this._capacity;
  }

  set isPubliclyListed(value: boolean) {
    this._isPubliclyListed = value;
    this._broadcastEmitter.emit('townSettingsUpdated', { isPubliclyListed: value });
  }

  get isPubliclyListed(): boolean {
    return this._isPubliclyListed;
  }

  get townUpdatePassword(): string {
    return this._townUpdatePassword;
  }

  get players(): Player[] {
    return this._players;
  }

  get pets(): EquippedPet[] {
    return this._pets;
  }

  get emotes(): ActiveEmote[] {
    return this._emotes;
  }

  get occupancy(): number {
    return this.players.length;
  }

  get friendlyName(): string {
    return this._friendlyName;
  }

  set friendlyName(value: string) {
    this._friendlyName = value;
    this._broadcastEmitter.emit('townSettingsUpdated', { friendlyName: value });
  }

  get townID(): string {
    return this._townID;
  }

  get interactables(): InteractableArea[] {
    return this._interactables;
  }

  /** The list of players currently in the town * */
  private _players: Player[] = [];

  /** The list of pets that are equipped in the town */
  private _pets: EquippedPet[] = [];

  /** The list of pets that are equipped in the town */
  private _emotes: ActiveEmote[] = [];

  /** The list of all players that have been in the town * */
  private _allPlayers: Player[] = [];

  /** The videoClient that this CoveyTown will use to provision video resources * */
  private _videoClient: IVideoClient = TwilioVideo.getInstance();

  private _interactables: InteractableArea[] = [];

  private readonly _townID: string;

  private _friendlyName: string;

  private readonly _townUpdatePassword: string;

  private _isPubliclyListed: boolean;

  private _capacity: number;

  private _broadcastEmitter: BroadcastOperator<ServerToClientEvents, SocketData>;

  private _connectedSockets: Set<CoveyTownSocket> = new Set();

  private _chatMessages: ChatMessage[] = [];

  /** A map to store player IDs with their currency and username * */
  private _playerCurrencyMap: CurrencyMap = new Map<
    string,
    { currency: number; username: string }
  >();

  /** A map to check if a tic tac toe game has already rewarded a player with currency * */
  private _gameCurrencyAwardedMap: Map<string, boolean> = new Map<string, boolean>();

  /**
   * Getter for the player currency map
   */

  public get playerCurrencyMap(): CurrencyMap {
    // TODO: get all players from the database, normalise to a map structure
    return this._playerCurrencyMap;
  }

  /**
   * Set currency for a player
   * @param playerID ID of the player
   * @param currency Currency value to set
   */
  public setPlayerCurrency(playerID: PlayerID, currency: number): void {
    const username = this._getUsernameForAllPlayers(playerID);
    // Set the player's currency
    this._playerCurrencyMap.set(playerID, { currency, username });

    // Emit event to all connected sockets with updated all time leaderboard
    this._emitAllTimeLeaderboard();
    // Emit event to all connected sockets with updated current player leaderboard
    this._emitCurrentLeaderboard();
  }

  /**
   * Get currency for a player
   * @param playerID ID of the player
   * @returns Currency value for the player
   */
  public getPlayerCurrency(playerID: PlayerID): number | undefined {
    return this._playerCurrencyMap.get(playerID)?.currency;
  }

  /**
   * Gets usernames for all players that have ever been in the town
   * @param playerID the player ID
   * @returns the player username
   */
  private _getUsernameForAllPlayers(playerID: PlayerID): string {
    const player = this._allPlayers.find(eachPlayer => eachPlayer.id === playerID);
    return player ? player.userName : 'Unknown';
  }

  /**
   * Gets usernames for players currently in the town
   * @param playerID the player ID
   * @returns the player username
   */
  private _getUsernameForCurrentPlayers(playerID: PlayerID): string {
    const player = this._players.find(eachPlayer => eachPlayer.id === playerID);
    return player ? player.userName : '';
  }

  constructor(
    friendlyName: string,
    isPubliclyListed: boolean,
    townID: string,
    broadcastEmitter: BroadcastOperator<ServerToClientEvents, SocketData>,
  ) {
    this._townID = townID;
    this._capacity = 50;
    this._townUpdatePassword = nanoid(24);
    this._isPubliclyListed = isPubliclyListed;
    this._friendlyName = friendlyName;
    this._broadcastEmitter = broadcastEmitter;
  }

  /**
   * This method emits the all-time leaderboard data to the frontend when called.
   * It sends information about player IDs, their corresponding currency counts, and usernames.
   */
  private _emitAllTimeLeaderboard(): void {
    // Extract player IDs, usernames, and currency counts from playerCurrencyMap
    const currencyPlayerIDList = Array.from(this.playerCurrencyMap.keys());
    const leaderboardData = Array.from(this.playerCurrencyMap.entries()).map(([playerID]) => ({
      currency: this.getPlayerCurrency(playerID),
      username: this._getUsernameForAllPlayers(playerID),
    }));

    // Emit the all-time leaderboard data to connected sockets
    this._connectedSockets.forEach(socket => {
      socket.emit('allTimeCurrencyChanged', {
        currencyPlayerIDs: currencyPlayerIDList,
        currencyDetails: leaderboardData,
      });
    });
  }

  /**
   * This method emits the current leaderboard data to the frontend when called.
   * It sends information about player IDs, their corresponding currency counts, and usernames.
   */
  private _emitCurrentLeaderboard(): void {
    // Extract player IDs, usernames, and currency counts from playerCurrencyMap
    const currencyPlayerIDList = Array.from(this.playerCurrencyMap.keys());
    const leaderboardData = Array.from(this.playerCurrencyMap.entries()).map(([playerID]) => ({
      currency: this.getPlayerCurrency(playerID),
      username: this._getUsernameForCurrentPlayers(playerID),
    }));

    // Emit the current leaderboard data to all connected sockets
    this._connectedSockets.forEach(socket => {
      socket.emit('currentCurrencyChanged', {
        currencyPlayerIDs: currencyPlayerIDList,
        currencyDetails: leaderboardData,
      });
    });
  }

  /**
   * Adds a player to this Covey Town, provisioning the necessary credentials for the
   * player, and returning them
   *
   * @param userName username of the new player
   * @param socket
   */
  async addPlayer(userName: string, socket: CoveyTownSocket): Promise<Player> {
    const newPlayer = new Player(userName, socket.to(this._townID));
    this._players.push(newPlayer);
    this._allPlayers.push(newPlayer);
    try {
      await addPlayerCurrencyToDao({ playerID: newPlayer.id, currency: 0 });
    } catch (error) {
      throw new Error(`Could not add new player currency to database: ${(error as Error).message}`);
    }
    this._connectedSockets.add(socket);
    // Creates the leaderboards for a player who just joined
    this._emitAllTimeLeaderboard();
    this._emitCurrentLeaderboard();
    // Create a video token for this user to join this town
    newPlayer.videoToken = await this._videoClient.getTokenForTown(this._townID, newPlayer.id);

    // Notify other players that this player has joined
    this._broadcastEmitter.emit('playerJoined', newPlayer.toPlayerModel());

    // Register an event listener for the client socket: if the client disconnects,
    // clean up our listener adapter, and then let the CoveyTownController know that the
    // player's session is disconnected
    socket.on('disconnect', () => {
      this._removePlayer(newPlayer);
      // Needs to update the current leaderboard and remove the player who left from the current
      // leaderboard and all-time leaderboard
      this._emitAllTimeLeaderboard();
      this._emitCurrentLeaderboard();
      this._connectedSockets.delete(socket);
    });

    // Set up a listener to forward all chat messages to all clients in the town
    socket.on('chatMessage', (message: ChatMessage) => {
      this._broadcastEmitter.emit('chatMessage', message);
      this._chatMessages.push(message);
      if (this._chatMessages.length > 200) {
        this._chatMessages.shift();
      }
    });

    // Register an event listener for the client socket: if the client updates their
    // location, inform the CoveyTownController
    socket.on('playerMovement', (movementData: PlayerLocation) => {
      try {
        this._updatePlayerLocation(newPlayer, movementData);
      } catch (err) {
        logError(err);
      }
    });

    // Register an event listener for the client socket: if the client updates their
    // location, inform the CoveyTownController
    socket.on('petMovement', (pet: EquippedPet) => {
      try {
        const petsToUpdate = this.pets.filter(
          p => p.playerID === pet.playerID && p.type === pet.type,
        );
        if (petsToUpdate.length === 1) {
          this._updatePetLocation(petsToUpdate[0], pet.location);
        } else {
          throw new Error('Duplicates in local pets list in Town.');
        }
      } catch (err) {
        logError(err);
      }
    });

    socket.on('emoteCreation', emote => {
      try {
        this._updateEmoteCreation(emote);
      } catch (err) {
        logError(err);
      }
    });

    socket.on('emoteDestruction', emote => {
      try {
        this._updateEmoteDestruction(emote);
      } catch (err) {
        logError(err);
      }
    });

    // Register an event listener for the client socket: if the client equips a pet,
    // inform the CoveyTownController
    socket.on('petEquipment', (toBeEquipped: EquippedPet) => {
      try {
        this._updatePetEquipment(toBeEquipped);
      } catch (err) {
        logError(err);
      }
    });

    // Register an event listener for the client socket: if the client unequips a pet,
    // inform the CoveyTownController
    socket.on('petUnequipment', ({ type, playerID }) => {
      try {
        if (type && playerID) {
          this._updatePetUnequipment(type, playerID);
        }
      } catch (err) {
        logError(err);
      }
    });

    // Set up a listener to process updates to interactables.
    // Currently only knows how to process updates for ViewingArea's, and
    // ignores any other updates for any other kind of interactable.
    // For ViewingArea's: dispatches an updateModel call to the viewingArea that
    // corresponds to the interactable being updated. Does not throw an error if
    // the specified viewing area does not exist.
    socket.on('interactableUpdate', (update: Interactable) => {
      if (isViewingArea(update)) {
        newPlayer.townEmitter.emit('interactableUpdate', update);
        const viewingArea = this._interactables.find(
          eachInteractable => eachInteractable.id === update.id,
        );
        if (viewingArea) {
          (viewingArea as ViewingArea).updateModel(update);
        }
      }
    });

    // Set up a listener to process commands to interactables.
    // Dispatches commands to the appropriate interactable and sends the response back to the client
    socket.on('interactableCommand', (command: InteractableCommand & InteractableCommandBase) => {
      // Finds the interactable object associated with the received command
      const interactable = this._interactables.find(
        eachInteractable => eachInteractable.id === command.interactableID,
      );
      // If the interactable object is found
      if (interactable) {
        try {
          const payload = interactable.handleCommand(command, newPlayer);
          // Convert the interactable object to a model and check its type
          const interactableModel = interactable.toModel();
          // If the interactable type is 'TicTacToeArea'
          if (interactableModel.type === 'TicTacToeArea') {
            // Narrows down the interactable object to TicTacToeGameArea type
            const ticTacToeGameArea = interactable as TicTacToeGameArea;
            // If the TicTacToe game is over and there's a winner
            if (ticTacToeGameArea.game?.state.winner) {
              const gameID = ticTacToeGameArea.game.id;
              // Ensure currency for this game hasn't been awarded yet
              if (!this._gameCurrencyAwardedMap.has(gameID)) {
                // Gets the winning player's ID
                const winnerID = ticTacToeGameArea.game.state.winner;
                // Get the current currency amount for the winner
                const winnerCurrency = this.getPlayerCurrency(winnerID);
                // If winner's currency is undefined, set it to a default amount (1 in this case)
                if (winnerCurrency === undefined) {
                  // Add default currency amount for the winner
                  this.setPlayerCurrency(winnerID, 1);
                  this._awardCurrency(winnerID, 1);
                } else {
                  // Increment currency for the winner
                  this.setPlayerCurrency(winnerID, winnerCurrency + 1);
                  this._awardCurrency(winnerID, 1);
                }
                // Mark that currency has been awarded for this game
                this._gameCurrencyAwardedMap.set(gameID, true);
              }
            }
          }
          // If the interactable type is 'ConnectFourArea'
          if (interactableModel.type === 'ConnectFourArea') {
            // Narrows down the interactable object to ConnectFourGameArea type
            const connectFourGameArea = interactable as ConnectFourGameArea;
            // If the Connect Four game is over and there's a winner
            if (connectFourGameArea.game?.state.winner) {
              const gameID = connectFourGameArea.game.id;
              // Ensure currency for this game hasn't been awarded yet
              if (!this._gameCurrencyAwardedMap.has(gameID)) {
                // Gets the winning player's ID
                const winnerID = connectFourGameArea.game.state.winner;
                // Get the current currency amount for the winner
                const winnerCurrency = this.getPlayerCurrency(winnerID);
                // If winner's currency is undefined, set it to a default amount (1 in this case)
                if (winnerCurrency === undefined) {
                  // Add default currency amount for the winner
                  this.setPlayerCurrency(winnerID, 2);
                  this._awardCurrency(winnerID, 2);
                } else {
                  // Increment currency for the winner
                  this.setPlayerCurrency(winnerID, winnerCurrency + 2);
                  this._awardCurrency(winnerID, 2);
                }
                // Mark that currency has been awarded for this game
                this._gameCurrencyAwardedMap.set(gameID, true);
              }
            }
          }
          socket.emit('commandResponse', {
            commandID: command.commandID,
            interactableID: command.interactableID,
            isOK: true,
            payload,
          });
        } catch (err) {
          if (err instanceof InvalidParametersError) {
            socket.emit('commandResponse', {
              commandID: command.commandID,
              interactableID: command.interactableID,
              isOK: false,
              error: err.message,
            });
          } else {
            logError(err);
            socket.emit('commandResponse', {
              commandID: command.commandID,
              interactableID: command.interactableID,
              isOK: false,
              error: 'Unknown error',
            });
          }
        }
      } else {
        socket.emit('commandResponse', {
          commandID: command.commandID,
          interactableID: command.interactableID,
          isOK: false,
          error: `No such interactable ${command.interactableID}`,
        });
      }
    });
    return newPlayer;
  }

  /**
   * Updates the database with the currency upon a Tic Tac Toe or Connect Four
   *
   * @param winner the ID of the winning player
   * @param currency the updated currency of the winner
   */
  private async _awardCurrency(winner: PlayerID, addedCurrency: number) {
    try {
      const currency = await findOnePlayerCurrencyFromDatabase(winner);
      await updateOnePlayerCurrencyInDao(winner, currency + addedCurrency);
    } catch (error) {
      throw new Error(
        `Could not update database with the awarded currency: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Destroys all data related to a player in this town.
   *
   * @param player
   */
  private _removePlayer(player: Player): void {
    if (player.location.interactableID) {
      this._removePlayerFromInteractable(player);
    }
    this._players = this._players.filter(p => p.id !== player.id);
    this._pets = this._pets.filter(pet => pet.playerID !== player.id);
    this._emotes = this._emotes.filter(emote => emote.playerID !== player.id);
    this._broadcastEmitter.emit('playerDisconnect', player.toPlayerModel());
  }

  /**
   * Updates the location of a player within the town
   *
   * If the player has changed conversation areas, this method also updates the
   * corresponding ConversationArea objects tracked by the town controller, and dispatches
   * any onConversationUpdated events as appropriate
   *
   * @param player Player to update location for
   * @param location New location for this player
   */
  private _updatePlayerLocation(player: Player, location: PlayerLocation): void {
    const prevInteractable = this._interactables.find(
      conv => conv.id === player.location.interactableID,
    );
    if (!prevInteractable?.contains(location)) {
      if (prevInteractable) {
        // Remove from old area
        prevInteractable.remove(player);
      }
      const newInteractable = this._interactables.find(
        eachArea => eachArea.isActive && eachArea.contains(location),
      );
      if (newInteractable) {
        newInteractable.add(player);
      }
      location.interactableID = newInteractable?.id;
    } else {
      location.interactableID = prevInteractable.id;
    }
    player.location = location;
    this._broadcastEmitter.emit('playerMoved', player.toPlayerModel());
  }

  private _updateEmoteCreation(emote: ActiveEmote) {
    this._emotes.filter(e => e.playerID !== emote.playerID);
    this._emotes.push(emote);
    this._broadcastEmitter.emit('emoteCreated', emote);
  }

  private _updateEmoteDestruction(emote: ActiveEmote) {
    this._emotes = this._emotes.filter(e => e.playerID !== emote.playerID);
    this._broadcastEmitter.emit('emoteDestroyed', emote);
  }

  /**
   * Updates the location of a pet within the town
   *
   * @param pet Pet to update location for
   * @param location New location for this pet
   */
  private _updatePetLocation(pet: EquippedPet, location: PetLocation): void {
    pet.location = location;
    this._broadcastEmitter.emit('petMoved', pet);
  }

  /**
   * Equips a pet within the town
   *
   * @param toBeEquipped pet to equip
   */
  private _updatePetEquipment(toBeEquipped: EquippedPet) {
    if (
      !this._pets.find(
        pet => pet.playerID === toBeEquipped.playerID && pet.type === toBeEquipped.type,
      )
    ) {
      this._pets = this._pets.filter(pet => pet.playerID !== toBeEquipped.playerID);
      this._pets.push(toBeEquipped);
    }
  }

  /**
   * Unequips a pet within the town
   *
   * @param type type of pet to be unequipped
   * @param playerID playerID of the player the pet belongs to
   */
  private _updatePetUnequipment(type: string, playerID: PlayerID) {
    this._pets = this._pets.filter(pet => pet.playerID !== playerID && pet.type !== type);
    this._emotes = this._emotes.filter(emote => emote.playerID !== playerID);
  }

  /**
   * Removes a player from a conversation area, updating the conversation area's occupants list,
   * and emitting the appropriate message (area updated or area destroyed)
   *
   * @param player Player to remove from their current conversation area
   */
  private _removePlayerFromInteractable(player: Player): void {
    const area = this._interactables.find(
      eachArea => eachArea.id === player.location.interactableID,
    );
    if (area) {
      area.remove(player);
    }
  }

  /**
   * Creates a new conversation area in this town if there is not currently an active
   * conversation with the same ID. The conversation area ID must match the name of a
   * conversation area that exists in this town's map, and the conversation area must not
   * already have a topic set.
   *
   * If successful creating the conversation area, this method:
   *  Adds any players who are in the region defined by the conversation area to it.
   *  Notifies all players in the town that the conversation area has been updated
   *
   * @param conversationArea Information describing the conversation area to create. Ignores any
   *  occupantsById that are set on the conversation area that is passed to this method.
   *
   * @returns true if the conversation is successfully created, or false if there is no known
   * conversation area with the specified ID or if there is already an active conversation area
   * with the specified ID
   */
  public addConversationArea(conversationArea: ConversationAreaModel): boolean {
    const area = this._interactables.find(
      eachArea => eachArea.id === conversationArea.id,
    ) as ConversationArea;
    if (!area || !conversationArea.topic || area.topic) {
      return false;
    }
    area.topic = conversationArea.topic;
    area.addPlayersWithinBounds(this._players);
    this._broadcastEmitter.emit('interactableUpdate', area.toModel());
    return true;
  }

  /**
   * Creates a new viewing area in this town if there is not currently an active
   * viewing area with the same ID. The viewing area ID must match the name of a
   * viewing area that exists in this town's map, and the viewing area must not
   * already have a video set.
   *
   * If successful creating the viewing area, this method:
   *    Adds any players who are in the region defined by the viewing area to it
   *    Notifies all players in the town that the viewing area has been updated by
   *      emitting an interactableUpdate event
   *
   * @param viewingArea Information describing the viewing area to create.
   *
   * @returns True if the viewing area was created or false if there is no known
   * viewing area with the specified ID or if there is already an active viewing area
   * with the specified ID or if there is no video URL specified
   */
  public addViewingArea(viewingArea: ViewingAreaModel): boolean {
    const area = this._interactables.find(
      eachArea => eachArea.id === viewingArea.id,
    ) as ViewingArea;
    if (!area || !viewingArea.video || area.video) {
      return false;
    }
    area.updateModel(viewingArea);
    area.addPlayersWithinBounds(this._players);
    this._broadcastEmitter.emit('interactableUpdate', area.toModel());
    return true;
  }

  /**
   * Creates a new pet shop area in this town if there is not currently an active
   * pet area with the same ID. The pet area ID must match the name of a
   * pet area that exists in this town's map
   *
   * If successful creating the pet shop area, this method:
   *    Adds any players who are in the region defined by the pet area to it
   *    Notifies all players in the town that the pet area has been updated by
   *      emitting an interactableUpdate event
   *
   * @param petArea Information describing the pet area to create.
   *
   * @returns True if the pet area was created or false if there is no known
   * pet area with the specified ID or if there is already an active pet area
   * with the specified ID
   */
  public addPetShopArea(petShopArea: PetShopAreaModel): boolean {
    const area = this._interactables.find(
      eachArea => eachArea.id === petShopArea.id,
    ) as PetShopArea;
    if (!area) {
      return false;
    }
    area.addPlayersWithinBounds(this._players);
    this._broadcastEmitter.emit('interactableUpdate', area.toModel());
    return true;
  }

  /**
   * Fetch a player's session based on the provided session token. Returns undefined if the
   * session token is not valid.
   *
   * @param token
   */
  public getPlayerBySessionToken(token: string): Player | undefined {
    return this.players.find(eachPlayer => eachPlayer.sessionToken === token);
  }

  /**
   * Find an interactable by its ID
   *
   * @param id
   * @returns the interactable
   * @throws Error if no such interactable exists
   */
  public getInteractable(id: string): InteractableArea {
    const ret = this._interactables.find(eachInteractable => eachInteractable.id === id);
    if (!ret) {
      throw new Error(`No such interactable ${id}`);
    }
    return ret;
  }

  /**
   * Retrieves all chat messages, optionally filtered by interactableID
   * @param interactableID optional interactableID to filter by
   */
  public getChatMessages(interactableID: string | undefined) {
    return this._chatMessages.filter(eachMessage => eachMessage.interactableID === interactableID);
  }

  /**
   * Informs all players' clients that they are about to be disconnected, and then
   * disconnects all players.
   */
  public disconnectAllPlayers(): void {
    this._broadcastEmitter.emit('townClosing');
    this._connectedSockets.forEach(eachSocket => eachSocket.disconnect(true));
  }

  /**
   * Initializes the town's state from a JSON map, setting the "interactables" property of this town
   * to instances of InteractableArea that match each interactable in the map.
   *
   * Each tilemap may contain "objects", and those objects may have properties. Towns
   * support two kinds of interactable objects: "ViewingArea" and "ConversationArea."
   * Initializing the town state from the map, then, means instantiating the corresponding objects.
   *
   * This method will throw an Error if the objects are not valid:
   * In the map file, each object is identified with a name. Names must be unique. Each object also has
   * some kind of geometry that establishes where the object is on the map. Objects must not overlap.
   *
   * @param mapFile the map file to read in, defaults to the "indoors" map in the frontend
   * @throws Error if there is no layer named "Objects" in the map, if the objects overlap or if object
   *  names are not unique
   */
  public initializeFromMap(map: ITiledMap) {
    const objectLayer = map.layers.find(
      eachLayer => eachLayer.name === 'Objects',
    ) as ITiledMapObjectLayer;
    if (!objectLayer) {
      throw new Error(`Unable to find objects layer in map`);
    }
    const viewingAreas = objectLayer.objects
      .filter(eachObject => eachObject.type === 'ViewingArea')
      .map(eachViewingAreaObject =>
        ViewingArea.fromMapObject(eachViewingAreaObject, this._broadcastEmitter),
      );
    const conversationAreas = objectLayer.objects
      .filter(eachObject => eachObject.type === 'ConversationArea')
      .map(eachConvAreaObj =>
        ConversationArea.fromMapObject(eachConvAreaObj, this._broadcastEmitter),
      );
    const gameAreas = objectLayer.objects
      .filter(eachObject => eachObject.type === 'GameArea')
      .map(eachGameAreaObj => GameAreaFactory(eachGameAreaObj, this._broadcastEmitter));

    const petAreas = objectLayer.objects
      .filter(eachObject => eachObject.type === 'PetShopArea')
      .map(eachInteractableObj =>
        PetShopArea.fromMapObject(eachInteractableObj, this._broadcastEmitter),
      );

    const inventoryAreas = objectLayer.objects
      .filter(eachObject => eachObject.type === 'InventoryArea')
      .map(eachInteractableObj =>
        InventoryArea.fromMapObject(eachInteractableObj, this._broadcastEmitter),
      );

    this._interactables = this._interactables
      .concat(viewingAreas)
      .concat(conversationAreas)
      .concat(gameAreas)
      .concat(petAreas)
      .concat(inventoryAreas);
    this._validateInteractables();
  }

  private _validateInteractables() {
    // Make sure that the IDs are unique
    const interactableIDs = this._interactables.map(eachInteractable => eachInteractable.id);
    if (
      interactableIDs.some(
        item => interactableIDs.indexOf(item) !== interactableIDs.lastIndexOf(item),
      )
    ) {
      throw new Error(
        `Expected all interactable IDs to be unique, but found duplicate interactable ID in ${interactableIDs}`,
      );
    }
    // Make sure that there are no overlapping objects
    for (const interactable of this._interactables) {
      for (const otherInteractable of this._interactables) {
        if (interactable !== otherInteractable && interactable.overlaps(otherInteractable)) {
          throw new Error(
            `Expected interactables not to overlap, but found overlap between ${interactable.id} and ${otherInteractable.id}`,
          );
        }
      }
    }
  }
}
