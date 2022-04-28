import numeral from 'numeral';

export class PriceBuilder {
  private price = 0;

  constructor(price = 0) {
    this.price = price;
  }

  vatTopup(percent: number) {
    this.price += (this.price * percent) / 100;
    return this;
  }

  discount(value: number) {
    this.price -= value < this.price ? value : this.price;
    return this;
  }

  discountPercent(value: number) {
    this.price -= (this.price * value) / 100;
    return this;
  }

  rawPrice() {
    return this.price;
  }

  money(numeralFormat = '0.00') {
    return numeral(this.price).format(numeralFormat);
  }

  moneyNumber() {
    return +this.money('0.00');
  }

  valueVat(percent: number) {
    return (this.price * percent) / 100;
  }

  value2c2p() {
    return numeral(this.price)
      .format('0.00')
      .replace('.', '')
      .padStart(12, '0');
  }
}
