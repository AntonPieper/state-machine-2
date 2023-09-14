import { GameObjects, Input } from "phaser"

type KeyCode = keyof typeof Input.Keyboard.KeyCodes;
type Pointer = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type KeyMap = Record<string, {keys?: readonly KeyCode[], pointers?: readonly Pointer[]}>;

export class InputManager<T extends KeyMap> {
  private state: Record<string, boolean> = {};
  constructor(gameObject: GameObjects.GameObject, keyMap: T) {
    for (const name in keyMap) {
      const { keys, pointers }= keyMap[name];
      if (keys) {
        this.bindKeys(gameObject, name, keys);
      }
      if (pointers) {
        this.bindPointers(gameObject, name, pointers);
      }
    }
  }

  isDown(name: keyof T): boolean {
    return this.state[name as string] ?? false;
  }

  private bindPointers(
    gameObject: GameObjects.GameObject, name: string, pointers: readonly Pointer[]
  ) {
    const input = gameObject.scene.input;

    type This = this;
    function pointerChange(this: This, params: { pointer: Input.Pointer }) {
      let i = 1
      let pointer: Input.Pointer | null = null;
      for (; i <= 10; ++i) {
        const currentPointer = input[`pointer${i as Pointer}`];
        if (params.pointer === currentPointer) {
          pointer = currentPointer;
          break;
        }
      }
      if (pointer && pointers.includes(i as Pointer)) {
        this.state[name] = pointer.isDown;
      }
    }

    const register = (type: "on" | "off") => {
      input[type](Input.Events.POINTER_DOWN, pointerChange, this);
      input[type](Input.Events.POINTER_UP, pointerChange, this);
    }
    register("on")
    gameObject.on(GameObjects.Events.DESTROY,
      (params: { gameObject: GameObjects.GameObject }) => {
        if (gameObject === params.gameObject) {
          register("off");
          // TODO: Do I need to deregister the destroy event?
        }
      }, this
    );
  }

  private bindKeys(gameObject: GameObjects.GameObject, name: string, keys: readonly KeyCode[]) {
    const input = gameObject.scene.input.keyboard;
    if (!input) return;
    type This = this;
    function keyChange(this: This, value: boolean, event: KeyboardEvent) {
      for (const key of keys) {
        if (Input.Keyboard.KeyCodes[key] === event.keyCode) {
          this.state[name] = value;
        }
      }
    }
    const keyDown = keyChange.bind(this, true);
    const keyUp = keyChange.bind(this, false);
    const register = (type: "on" | "off") => {
      input![type](Input.Keyboard.Events.ANY_KEY_DOWN, keyDown, this);
      input![type](Input.Keyboard.Events.ANY_KEY_UP, keyUp, this);
    }
    register("on");
    gameObject.on(GameObjects.Events.DESTROY,
      (params: { gameObject: GameObjects.GameObject }) => {
        if (gameObject === params.gameObject) {
          register("off");
          // TODO: Do I need to deregister the destroy event?
        }
      }, this
    );
  }
}
