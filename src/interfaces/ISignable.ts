type ABIEncoding = {
  types: string[];
  // eslint-disable-next-line
  value: any[];
}

export default interface ISignable {
  signature: Array<string> | string;
  getSignable(): ABIEncoding;
}