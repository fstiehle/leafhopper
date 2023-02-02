import IProcess from "src/interfaces/IProcess";
import Step from "./Step";

export default class Process implements IProcess {
  caseID = 0;
  steps = new Array<Step>();
  tokenState = new Array<number>()
  pubKeys = new Map<number, string>();
}