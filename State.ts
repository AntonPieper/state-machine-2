export interface Context<T extends State<any>> {
  setState(state: T): void;
}

export abstract class State<T extends Context<any>> {
  constructor(protected context: T) { }
}
