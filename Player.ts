import { Input, Physics, Scene } from "phaser";
import { State, Context } from "./State";
import { HeroStrategy } from "./Hero";
import { Knight } from "./Knight";

export type MoveInput = { x: number, y: number };

export abstract class PlayerState extends State<Player> {
  onUpdate() { }
  onEnter() { }
  onExit() { }
  onPointerDown() { }
  onMove(input: MoveInput) { }
}

export class Player extends Physics.Arcade.Sprite implements Context<PlayerState> {
  #hero: HeroStrategy = new Knight();
  #state: PlayerState | null = null;
  #movementInput: MoveInput = { x: 0, y: 0 };
  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, Knight.texture);
    // TODO: deregister from events on destroy
    // TODO: Input manager class to abstract all this away.
    this.scene.input.on(Input.Events.POINTER_DOWN, () => {
      this.#state?.onPointerDown();
    });
    const keyboard = this.scene.input.keyboard!;
    const handleKey = (amount: number, event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyW":
        case "KeyUp":
          this.#movementInput.y += amount;
          break;
        case "KeyS":
        case "KeyDown":
          this.#movementInput.y -= amount;
          break;
        case "KeyD":
        case "LeyRight":
          this.#movementInput.x += amount;
          break;
        case "KeyA":
        case "KeyLeft":
          this.#movementInput.x -= amount;
          break;
      }
      // TODO: only call once per frame
      this.#state?.onMove(this.#movementInput);
    };

    keyboard.on(Input.Keyboard.Events.ANY_KEY_DOWN, handleKey.bind(this, 1), this);
    keyboard.on(Input.Keyboard.Events.ANY_KEY_UP, handleKey.bind(this, -1), this);
  }

  transition(state: PlayerState | null): void {
    this.#state?.onExit();
    this.#state = state;
    this.#state?.onEnter();
  }

  setHero(hero: HeroStrategy) {
    this.transition(null);
    this.#hero = hero;
  }

  override update() {
    if (!this.state) {
      const texture = this.#hero.init(this.scene);
      this.setTexture(texture);
      this.transition(this.#hero.initialState(this));
    }
    this.#state?.onUpdate();
  }
}
