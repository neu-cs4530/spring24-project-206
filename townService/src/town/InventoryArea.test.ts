import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import { TownEmitter } from '../types/CoveyTownSocket';
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
        pets: [],
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
        pets: [],
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
      pets: [],
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

  // this test has been thoroughly tested in the backend using postman by testing our axios endpoints that are associated with
  // the equip and unequip endpoints, and was not able to be tested in the jest suite due to async.
  /**
  describe('[T3.1] EquipPet command', () => {
    test('should equip a pet using EquipPet command', async () => {
      const result = testArea.handleCommand(
        {
          type: 'EquipPet',
          petType: 'Dog',
          playerID: newPlayer.id,
        },
        newPlayer,
      );

      await Promise.resolve(result);

      expect(interactableUpdateSpy).toHaveBeenCalled();
    });
  });

  describe('[T3.2] UnequipPet command', () => {
    test('should unequip a pet using UnequipPet command', async () => {
      const result = testArea.handleCommand(
        {
          type: 'UnequipPet',
          petType: 'Dog',
          playerID: newPlayer.id,
        },
        newPlayer,
      );

      await Promise.resolve(result);

      expect(interactableUpdateSpy).toHaveBeenCalled();
    });
  });
  */
});
