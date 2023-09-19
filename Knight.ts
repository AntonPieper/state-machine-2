import { Animations, Scene } from "phaser";
import { MoveInput, Player, PlayerState } from "./Player";
import { HeroStrategy } from "./Hero";
import { createAnimations } from "./Animation";

const enum Anims {
  Idle = "idle",
  Walk = "walk",
  Attack = "attack"
}

export class Knight implements HeroStrategy {
  init(scene: Scene): string {
    // Create knight animations with helper
    createAnimations(scene, {
      texture: Knight.texture,
      key: Knight.key,
      prefix: Knight.prefix,
      animations: {
        [Anims.Idle]: { start: 1, end: 6, repeat: -1, frameRate: 6 },
        [Anims.Walk]: { start: 1, end: 6, repeat: -1, frameRate: 11 },
        [Anims.Attack]: { start: 1, end: 6, repeat: 0, frameRate: 15 }
      }
    });
    return Knight.texture;
  }

  initialState(context: Player): PlayerState {
    return new Movement(context);
  }

  static animation(name: Anims) {
    return Knight.key(name);
  }

  static readonly texture = "knight";

  /** Get animation name */
  private static key(name: string) {
    return `${Knight.texture}-${name}`;
  }

  /** Get animation name prefix */
  private static prefix(name: string) {
    return `${name}-`;
  }
}

// Knight States

/**
 * Movement state handles idle and walking. 
 * A click will transition to the {@link SwordAttack} state.
 **/
export class Movement extends PlayerState {
  constructor(context: Player) {
    super(context);
  }

  onEnter(): void {
      this.context.play(Knight.animation(Anims.Idle));
  }

  onMove(input: MoveInput): void {
    const velocity = this.context.body!.velocity;
    velocity.x = input.x;
    velocity.y = input.y;
    const speedSq = velocity.x * velocity.x + velocity.y * velocity.y;
    if (speedSq > 0.1) {
      this.context.play(Knight.animation(Anims.Walk), true);
    } else {
      this.context.play(Knight.animation(Anims.Idle), true);
    }
  }

  onPointerDown(): void {
    this.context.transition(new SwordAttack(this.context));
  }
}

export class SwordAttack extends PlayerState {
  constructor(context: Player) {
    super(context);
  }

  onEnter(): void {
    const velocity = this.context.body!.velocity;
    velocity.x = velocity.y = 0; // Stop movement
    this.context.play(Knight.animation(Anims.Attack));
    this.context.once(Animations.Events.ANIMATION_COMPLETE, () => {
      this.context.transition(new Movement(this.context));
    });
  }
}
