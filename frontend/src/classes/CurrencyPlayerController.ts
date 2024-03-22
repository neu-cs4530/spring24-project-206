import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';

export type CurrencyPlayerEvents = {
  currencyChange: (newCurrency: number) => void;
};

export default class CurrencyPlayerController extends (EventEmitter as new () => TypedEmitter<CurrencyPlayerEvents>) {
  private _currency: number;

  private readonly _id: string;

  constructor(id: string, initialCurrency: number) {
    super();
    this._id = id;
    this._currency = initialCurrency;
  }

  set currency(newCurrency: number) {
    this._currency = newCurrency;
    this.emit('currencyChange', newCurrency);
  }

  get currency(): number {
    return this._currency;
  }

  get id(): string {
    return this._id;
  }

  incrementCurrency(): void {
    this._currency += 1;
  }

  toPlayerModel(): CurrencyPlayerModel {
    return { id: this.id, currency: this.currency };
  }

  static fromPlayerModel(modelPlayer: CurrencyPlayerModel): CurrencyPlayerController {
    return new CurrencyPlayerController(modelPlayer.id, modelPlayer.currency);
  }
}
