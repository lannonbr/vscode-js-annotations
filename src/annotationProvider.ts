import { Range, DecorationInstanceRenderOptions, DecorationOptions } from "vscode";

export class Annotations {
  static paramAnnotation(message: string, range: Range): DecorationOptions {
    return {
      range,
      renderOptions: {
        before: {
          contentText: message,
          color: "#a6a6a6"
        }
      } as DecorationInstanceRenderOptions
    } as DecorationOptions;
  }
}
