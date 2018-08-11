import { Range, DecorationInstanceRenderOptions, DecorationOptions } from "vscode";

export class Annotations {
  static paramAnnotation(message: string, range: Range): DecorationOptions {
    return {
      range,
      renderOptions: {
        before: {
          contentText: message,
          color: "#6a6a6a"
        }
      } as DecorationInstanceRenderOptions
    } as DecorationOptions;
  }
}
