import { ABIEncoding } from "./IProof";

export default interface ISignable {
  getSignable(): ABIEncoding;
}