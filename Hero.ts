import Phaser from "phaser";
import { Player, PlayerState } from "./Player";

export interface HeroStrategy {
  init(scene: Phaser.Scene): void;
  initialState(context: Player): PlayerState;
};

export type AttackStrategy = (context: Player) => void;

export class SimpleIdle extends PlayerState {
  constructor(
    context: Player,
    private anim: string,
    private attackStrategy: AttackStrategy = () => { }
  ) {
    super(context);
  }

  onEnter(): void {
    this.context.sprite.play(this.anim);
  }

  onPointerDown(): void {
      this.attackStrategy(this.context);
  }
}
