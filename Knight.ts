import { Animations, GameObjects, Scene } from "phaser";
import { Player, PlayerState } from "./Player";
import { HeroStrategy, SimpleIdle } from "./Hero";
import { InputManager, KeyMap } from "./InputManager";

export type Transformer<T> = (original: T) => T;

export type AnimationConfig =  {
  start: number,
  end: number,
  repeat: number,
  frameRate: number
};

export type CreateAnimationsConfig = {
  texture: string,
  animations: Record<string | number, AnimationConfig>,
  key?: Transformer<string>,
  prefix?: Transformer<string>,
  suffix?: string
};

export function createAnimations(
  scene: Scene,
  {
    texture, key = (s) => s, prefix = (s) => s, suffix = ".png", animations
  }: CreateAnimationsConfig
): void {
  for (const animName in animations) { 
    scene.anims.create({
      key: key(animName),
      frames: scene.anims.generateFrameNames(texture, {
        start: animations[animName].start,
        end: animations[animName].end,
        prefix: prefix(Anims.Idle), suffix,
      }),
      repeat: animations[animName].repeat,
      frameRate: animations[animName].frameRate
    });
  }
}

enum Anims {
  Idle = "idle",
  Walk = "walk",
  Attack = "attack"
}
const InputMap = {
      up: { keys: ["W", "UP"] },
      down: { keys: ["S", "DOWN"] },
      left: { keys: ["A", "LEFT"] },
      right: { keys: ["D", "RIGHT"] }
} as const satisfies KeyMap;

export default class Knight implements HeroStrategy {
  private inputs!: InputManager<typeof InputMap>;
  init(scene: Scene): void {
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
  }

  initialState(context: Player): PlayerState {
    this.inputs = new InputManager(context.sprite, InputMap);
    return new Idle(context, this.inputs);
  }

  static animation(name: Anims) {
    return Knight.key(name);
  }

  private static readonly texture = "knight";

  private static key(name: string) {
    return `${Knight.texture}-${name}`;
  }

  private static prefix(name: string) {
    return `${name}-`;
  }
}

export class Idle extends SimpleIdle {
  constructor(context: Player, private inputs: Knight["inputs"]) {
    super(context, Knight.animation(Anims.Idle), (ctx) => new SwordAttack(ctx));
  }
}

export class SwordAttack extends PlayerState {
  constructor(context: Player) {
    super(context);
  }

  onEnter(): void {
    this.context.sprite.play({
      key: "sword_attack"
    });
    this.context.sprite.once(Animations.Events.ANIMATION_COMPLETE, () => {
      this.context.setState(new SwordAttack(this.context));
    });
  }
}
