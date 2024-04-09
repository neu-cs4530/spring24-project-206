import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import { EquipCommand, InteractableCommand, TownEmitter } from '../types/CoveyTownSocket';
import InventoryArea from './InventoryArea';

describe('InventoryArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: InventoryArea;
  const townEmitter = mock<TownEmitter>();
  const id = nanoid();
  let newPlayer: Player;
  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new InventoryArea({ pets: [], id, occupants: [] }, testAreaBox, townEmitter);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
  });
  describe('add', () => {
    it('Adds the player to the occupants list and emits an interactableUpdate event', () => {
      expect(testArea.occupantsByID).toEqual([newPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        occupants: [newPlayer.id],
        type: 'InventoryArea',
      });
    });
    it("Sets the player's conversationLabel and emits an update for their location", () => {
      expect(newPlayer.location.interactableID).toEqual(id);
      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toEqual(id);
    });
  });
  describe('remove', () => {
    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
      // Add another player so that we are not also testing what happens when the last player leaves
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(extraPlayer);
      testArea.remove(newPlayer);
      expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        occupants: [extraPlayer.id],
        type: 'InventoryArea',
      });
    });
    it("Clears the player's conversationLabel and emits an update for their location", () => {
      testArea.remove(newPlayer);
      expect(newPlayer.location.interactableID).toBeUndefined();
      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toBeUndefined();
    });
  });
  test('toModel sets the ID, pets and occupants and sets no other properties', () => {
    const model = testArea.toModel();
    expect(model).toEqual({
      id,
      occupants: [newPlayer.id],
      type: 'InventoryArea',
    });
  });
  describe('fromMapObject', () => {
    it('Throws an error if the width or height are missing', () => {
      expect(() =>
        InventoryArea.fromMapObject(
          { id: 1, name: nanoid(), visible: true, x: 0, y: 0 },
          townEmitter,
        ),
      ).toThrowError();
    });
    it('Creates a new inventory area using the provided boundingBox and id, with an empty occupants list', () => {
      const x = 30;
      const y = 20;
      const width = 10;
      const height = 20;
      const name = 'name';
      const val = InventoryArea.fromMapObject(
        { x, y, width, height, name, id: 10, visible: true },
        townEmitter,
      );
      expect(val.boundingBox).toEqual({ x, y, width, height });
      expect(val.id).toEqual(name);
      expect(val.occupantsByID).toEqual([]);
    });
  });
  describe('handleCommand', () => {
    it('should equip a pet and emit petEquipped event', () => {
      const command: EquipCommand = {
        type: 'EquipPet',
        toBeEquipped: {
          type: 'dog',
          playerID: newPlayer.id,
          location: { x: 0, y: 0, rotation: 'front' },
          imgID: 1, // Add imgID
        },
      };
      testArea.handleCommand(command, newPlayer);
      expect(townEmitter.emit).toHaveBeenCalledWith('petEquipped', command.toBeEquipped);
    });

    it('should unequip a pet and emit petUnequipped event', () => {
      const command: InteractableCommand = {
        type: 'UnequipPet',
        petType: 'cat',
        playerID: newPlayer.id,
      };
      testArea.handleCommand(command, newPlayer);
      expect(townEmitter.emit).toHaveBeenCalledWith('petUnequipped', {
        type: command.petType,
        playerID: command.playerID,
      });
    });
  });
});
