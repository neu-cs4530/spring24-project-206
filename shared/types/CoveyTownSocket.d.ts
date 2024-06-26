export type TownJoinResponse = {
  /** Unique ID that represents this player * */
  userID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  sessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this town * */
  currentPlayers: Player[];
  /** List of pets currently in this town * */
  currentPets: EquippedPet[];
  /** List of emotes currently in this town * */
  currentEmotes: ActiveEmote[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;
  /** Current state of interactables in this town */
  interactables: TypedInteractable[];
};

export type CurrencyChangeResponse = {
  // A list of the player IDs
  currencyPlayerIDs: string[];
  // A list of player currencies and usernames
  currencyDetails: { currency?: number; username: string }[];
};

export type InteractableType =
  | "ConversationArea"
  | "ViewingArea"
  | "TicTacToeArea"
  | "ConnectFourArea"
  | "PetShopArea"
  | "InventoryArea";

// Define the map to store player IDs and their currency
type CurrencyMap = Map<PlayerID, { currency?: number; username: string }>;

export interface Interactable {
  type: InteractableType;
  id: InteractableID;
  occupants: PlayerID[];
}

export type TownSettingsUpdate = {
  friendlyName?: string;
  isPubliclyListed?: boolean;
};

export type Direction = "front" | "back" | "left" | "right";

export type PlayerID = string;

export interface Player {
  id: PlayerID;
  userName: string;
  location: PlayerLocation;
}

export interface EquippedPet {
  type: string;
  playerID: PlayerID;
  location: PetLocation;
  imgID: number;
}

export interface ActiveEmote {
  emote: EmoteType;
  playerID: PlayerID;
  location: PetLocation;
}

export type EmoteType = "alert" | "disgust" | "happy" | "love" | "sad";

export type XY = { x: number; y: number };

export interface PlayerLocation {
  /* The CENTER x coordinate of this player's location */
  x: number;
  /* The CENTER y coordinate of this player's location */
  y: number;
  /** @enum {string} */
  rotation: Direction;
  moving: boolean;
  interactableID?: string;
}

export interface PetLocation {
  /* The CENTER x coordinate of this pet's location */
  x: number;
  /* The CENTER y coordinate of this pet's location */
  y: number;
  /** @enum {string} */
  rotation: Direction;
}

export type ChatMessage = {
  author: string;
  sid: string;
  body: string;
  dateCreated: Date;
  interactableID?: string;
};

export interface ConversationArea extends Interactable {
  topic?: string;
}

export interface PetShopArea extends Interactable {
  pets?: Pet[];
}

export interface InventoryArea extends Interactable {
  pets?: Pet[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewingArea extends Interactable {
  video?: string;
  isPlaying: boolean;
  elapsedTimeSec: number;
}

export type GameStatus =
  | "IN_PROGRESS"
  | "WAITING_TO_START"
  | "OVER"
  | "WAITING_FOR_PLAYERS";

/**
 * Base type for the state of a game
 */
export interface GameState {
  status: GameStatus;
}

/**
 * Type for the state of a game that can be won
 */
export interface WinnableGameState extends GameState {
  winner?: PlayerID;
}

/**
 * Base type for a move in a game. Implementers should also extend MoveType
 * @see MoveType
 */
export interface GameMove<MoveType> {
  playerID: PlayerID;
  gameID: GameInstanceID;
  move: MoveType;
}

export type TicTacToeGridPosition = 0 | 1 | 2;

/**
 * Type for a move in TicTacToe
 */
export interface TicTacToeMove {
  gamePiece: "X" | "O";
  row: TicTacToeGridPosition;
  col: TicTacToeGridPosition;
}

/**
 * Type for the state of a TicTacToe game
 * The state of the game is represented as a list of moves, and the playerIDs of the players (x and o)
 * The first player to join the game is x, the second is o
 */
export interface TicTacToeGameState extends WinnableGameState {
  moves: ReadonlyArray<TicTacToeMove>;
  x?: PlayerID;
  o?: PlayerID;
}

/**
 * Type for the state of a ConnectFour game.
 * The state of the game is represented as a list of moves, and the playerIDs of the players (red and yellow)
 */
export interface ConnectFourGameState extends WinnableGameState {
  // The moves in this game
  moves: ReadonlyArray<ConnectFourMove>;
  // The playerID of the red player, if any
  red?: PlayerID;
  // The playerID of the yellow player, if any
  yellow?: PlayerID;
  // Whether the red player is ready to start the game
  redReady?: boolean;
  // Whether the yellow player is ready to start the game
  yellowReady?: boolean;
  // The color of the player who will make the first move
  firstPlayer: ConnectFourColor;
}

/**
 * Type for a move in ConnectFour
 * Columns are numbered 0-6, with 0 being the leftmost column
 * Rows are numbered 0-5, with 0 being the top row
 */
export interface ConnectFourMove {
  gamePiece: ConnectFourColor;
  col: ConnectFourColIndex;
  row: ConnectFourRowIndex;
}

/**
 * Row indices in ConnectFour start at the top of the board and go down
 */
export type ConnectFourRowIndex = 0 | 1 | 2 | 3 | 4 | 5;
/**
 * Column indices in ConnectFour start at the left of the board and go right
 */
export type ConnectFourColIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ConnectFourColor = "Red" | "Yellow";

export type InteractableID = string;
export type GameInstanceID = string;

/**
 * Type for the result of a game
 */
export interface GameResult {
  gameID: GameInstanceID;
  scores: { [playerName: string]: number };
}

/**
 * Base type for an *instance* of a game. An instance of a game
 * consists of the present state of the game (which can change over time),
 * the players in the game, and the result of the game
 * @see GameState
 */
export interface GameInstance<T extends GameState> {
  state: T;
  id: GameInstanceID;
  players: PlayerID[];
  result?: GameResult;
}

/**
 * Base type for an area that can host a game
 * @see GameInstance
 */
export interface GameArea<T extends GameState> extends Interactable {
  game: GameInstance<T> | undefined;
  history: GameResult[];
}

export type CommandID = string;

/**
 * Base type for a command that can be sent to an interactable.
 * This type is used only by the client/server interface, which decorates
 * an @see InteractableCommand with a commandID and interactableID
 */
interface InteractableCommandBase {
  /**
   * A unique ID for this command. This ID is used to match a command against a response
   */
  commandID: CommandID;
  /**
   * The ID of the interactable that this command is being sent to
   */
  interactableID: InteractableID;
  /**
   * The type of this command
   */
  type: string;
}

export type InteractableCommand =
  | ViewingAreaUpdateCommand
  | JoinGameCommand
  | GameMoveCommand<TicTacToeMove>
  | GameMoveCommand<ConnectFourMove>
  | StartGameCommand
  | LeaveGameCommand
  | AdoptCommand
  | EquipCommand
  | UnequipCommand;

export interface ViewingAreaUpdateCommand {
  type: "ViewingAreaUpdate";
  update: ViewingArea;
}

export interface JoinGameCommand {
  type: "JoinGame";
}

export interface LeaveGameCommand {
  type: "LeaveGame";
  gameID: GameInstanceID;
}

export interface StartGameCommand {
  type: "StartGame";
  gameID: GameInstanceID;
}

export interface GameMoveCommand<MoveType> {
  type: "GameMove";
  gameID: GameInstanceID;
  move: MoveType;
}

export interface AdoptCommand {
  type: "AdoptPet";
  petType: string;
  playerID: PlayerID;
}

export interface EquipCommand {
  type: "EquipPet";
  toBeEquipped: EquippedPet;
}

export interface UnequipCommand {
  type: "UnequipPet";
  petType: string;
  playerID: PlayerID;
}

export type InteractableCommandReturnType<
  CommandType extends InteractableCommand
> = CommandType extends JoinGameCommand
  ? { gameID: string }
  : CommandType extends ViewingAreaUpdateCommand
  ? undefined
  : CommandType extends GameMoveCommand<TicTacToeMove>
  ? undefined
  : CommandType extends LeaveGameCommand
  ? undefined
  : CommandType extends AdoptCommand
  ? undefined
  : CommandType extends EquipCommand
  ? undefined
  : CommandType extends UnequipCommand
  ? undefined
  : never;

export type InteractableCommandResponse<MessageType> = {
  commandID: CommandID;
  interactableID: InteractableID;
  error?: string;
  payload?: InteractableCommandResponseMap[MessageType];
};

export interface ServerToClientEvents {
  playerMoved: (movedPlayer: Player) => void;
  petMoved: (movedPet: EquippedPet) => void;
  emoteCreated: (emote: ActiveEmote) => void;
  emoteDestroyed: (emote: ActiveEmote) => void;
  playerDisconnect: (disconnectedPlayer: Player) => void;
  playerJoined: (newPlayer: Player) => void;
  initialize: (initialData: TownJoinResponse) => void;
  townSettingsUpdated: (update: TownSettingsUpdate) => void;
  townClosing: () => void;
  chatMessage: (message: ChatMessage) => void;
  interactableUpdate: (interactable: Interactable) => void;
  commandResponse: (response: InteractableCommandResponse) => void;
  allTimeCurrencyChanged: (currency: CurrencyChangeResponse) => void;
  currentCurrencyChanged: (currency: CurrencyChangeResponse) => void;
  insufficientCurrency: () => void;
  petEquipped: (toBeEquipped: EquippedPet) => void;
  petUnequipped: (toBeUnequipped: Partial<EquippedPet>) => void;
}

export interface ClientToServerEvents {
  chatMessage: (message: ChatMessage) => void;
  playerMovement: (movementData: PlayerLocation) => void;
  petMovement: (movementData: EquippedPet) => void;
  interactableUpdate: (update: Interactable) => void;
  interactableCommand: (
    command: InteractableCommand & InteractableCommandBase
  ) => void;
  petEquipment: (toBeEquipped: EquippedPet) => void;
  petUnequipment: (toBeUnequipped: Partial<EquippedPet>) => void;
  emoteCreation: (emote: ActiveEmote) => void;
  emoteDestruction: (emote: ActiveEmote) => void;
}
