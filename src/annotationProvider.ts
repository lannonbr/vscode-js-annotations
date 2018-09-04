import { DecorationInstanceRenderOptions, DecorationOptions, Range, ThemeColor } from "vscode";

export class Annotations {
  public static paramAnnotation(message: string, range: Range): DecorationOptions {

    return {
      range,
      renderOptions: {
        before: {
          color: new ThemeColor("jsannotations.annotationForeground"),
          contentText: message,
          fontStyle: "italic"
        }
      } as DecorationInstanceRenderOptions
    } as DecorationOptions;
  }

  public static errorParamAnnotation(range: Range): DecorationOptions {

    return {
      range,
      renderOptions: {
        before: {
          color: "red",
          contentText: "❗️ Invalid parameter: ",
          fontWeight: "800"
        }
      } as DecorationInstanceRenderOptions
    } as DecorationOptions;
  }
}
