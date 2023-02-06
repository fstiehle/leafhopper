type SignableParts = {
  types: string[];
  // eslint-disable-next-line
  value: any[];
}

export default interface ISignable {
  signature: Array<string>;
  getSignable(withSignature?: boolean): SignableParts;
}