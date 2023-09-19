import Phaser from "phaser";
import { Player, PlayerState } from "./Player";

export interface HeroStrategy {
  /** Initialize hero and return texture name. */
  init(scene: Phaser.Scene): string;
  /** Construct and return initial state. */
  initialState(context: Player): PlayerState;
}
