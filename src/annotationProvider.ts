import { Range, DecorationInstanceRenderOptions, DecorationOptions, workspace, ThemeColor } from "vscode";

export class Annotations {
  static paramAnnotation(message: string, range: Range): DecorationOptions {

    return {
      range,
      renderOptions: {
        before: {
          contentText: message,
          fontStyle: "italic",
          color: new ThemeColor('jsannotations.annotationForeground')
        }
      } as DecorationInstanceRenderOptions
    } as DecorationOptions;
  }
}
