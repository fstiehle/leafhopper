export type ABIEncoding = {
  types: string[];
  // eslint-disable-next-line
  value: any[];
}

export default interface IProof {
  index: number;
  from: number;
  caseID: number;
  taskID: number; 
  newTokenState: number;
  signatures: string[];
}