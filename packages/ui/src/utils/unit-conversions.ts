import { evaluate } from 'mathjs';

export function unitConversion(
  type: 'centsToDollars' | 'dollarsToCents' | 'bitsToMb' | 'mbToBits' | 'bytesToGb' | 'gbToBytes',
  value?: number | string,
) {
  if (!value) return;
  switch (type) {
    case 'centsToDollars':
      return evaluate(`${value} / 100`);
    case 'dollarsToCents':
      return evaluate(`${value} * 100`);
    case 'bitsToMb':
      return evaluate(`${value} / 1000 / 1000`);
    case 'mbToBits':
      return evaluate(`${value} * 1000 * 1000`);
    case 'bytesToGb':
      return evaluate(`${value} / 1000 / 1000 / 1000`);
    case 'gbToBytes':
      return evaluate(`${value} * 1000 * 1000 * 1000`);
    default:
      throw new Error('Invalid conversion type');
  }
}
