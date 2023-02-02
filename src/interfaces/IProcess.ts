import Step from "../classes/Step";

export default interface IProcess {
  caseID: number;
  steps: Step[];
  tokenState: Array<number>;
  pubKeys: Map<number, string>;
}