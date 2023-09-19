import { Scene } from "phaser";

export type AnimationConfig =  {
  start: number,
  end: number,
  repeat: number,
  frameRate: number
};

export type Transformer<T> = (original: T) => T;

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
        prefix: prefix(animName),
        suffix
      }),
      repeat: animations[animName].repeat,
      frameRate: animations[animName].frameRate
    });
  }
}
