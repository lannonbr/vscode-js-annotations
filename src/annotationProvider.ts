import { Range, DecorationInstanceRenderOptions, DecorationOptions } from "vscode";

export class Annotations {
  static paramAnnotation(message: string, range: Range): DecorationOptions {
    return {
      range,
      renderOptions: {
        light: {
          before: {
            color: "#444"
          }
        },
        dark: {
          before: {
            color: "#ccc"
          }
        },
        before: {
          contentText: message,
          fontWeight: "800"
        }
      } as DecorationInstanceRenderOptions
    } as DecorationOptions;
  }
}
