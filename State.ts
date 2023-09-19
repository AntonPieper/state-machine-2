export interface Context<T extends State<any>> {
  /** Transition from one state to another. */
  transition(state: T): void;
}

export abstract class State<T extends Context<any>> {
  constructor(protected context: T) { }
}
