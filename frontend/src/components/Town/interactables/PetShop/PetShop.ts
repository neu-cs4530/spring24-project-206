import Interactable, { KnownInteractableTypes } from '../../Interactable';

// Define the PetShop class, which extends Interactable
export default class PetShop extends Interactable {
  // Flag to track if the player is interacting with the pet shop
  private _isInteracting = true;

  // Method called when the pet shop is added to the scene. Sets the style of the pet shop
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

  // Method called when the player exits the overlap with the pet shop
  overlapExit(): void {
    if (this._isInteracting) {
      this.townController.interactableEmitter.emit('endInteraction', this);
      this._isInteracting = false;
    }
  }

  // Method called when the player interacts with the pet shop
  interact(): void {
    this._isInteracting = true;
  }

  // Method to get the type of the interactable (pet shop)
  getType(): KnownInteractableTypes {
    return 'petShop';
  }
}
