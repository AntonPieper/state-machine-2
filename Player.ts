import { GameObjects } from "phaser";
import { State, Context } from "./State";
import { HeroStrategy } from "./Hero";
import Knight from "./Knight";

export abstract class PlayerState extends State<Player> {
  onUpdate() { }
  onEnter() { }
  onExit() { }
  onPointerDown() { }
}


export class Player implements Context<PlayerState> {
  private hero = new Knight();
  private state: PlayerState | null = null;
  constructor(readonly sprite: GameObjects.Sprite) { }
  setState(state: PlayerState | null): void {
    this.state?.onExit();
    this.state = state;
    this.state?.onEnter();
  }

  setHero(hero: HeroStrategy) {
    this.setState(null);
    this.hero = hero;
  }

  update() {
    if (!this.state) {
      this.hero.init(this.sprite.scene);
      this.setState(this.hero.initialState(this));
    }
    this.state?.onUpdate();
  }
}
