import Interactable, { KnownInteractableTypes } from '../../Interactable';

// Define the Inventory class, which extends Interactable
export default class Inventory extends Interactable {
  // Flag to track if the player is interacting with the inventory
  private _isInteracting = true;

  // Method called when the inventory is added to the scene. Sets the style of the inventory
  addedToScene() {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);
    this.setDepth(-1);
    this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y + this.displayHeight / 2,
      this.name,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
  }

  // Method called when the player exits the overlap with the inventory
  overlapExit(): void {
    if (this._isInteracting) {
      // Emit an event to end the interaction with the inventory
      this.townController.interactableEmitter.emit('endInteraction', this);
      this._isInteracting = false;
    }
  }

  // Method called when the player interacts with the inventory
  interact(): void {
    this._isInteracting = true;
  }

  // Method to get the type of the interactable (inventory)
  getType(): KnownInteractableTypes {
    return 'inventory';
  }
}
