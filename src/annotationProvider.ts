import { DecorationInstanceRenderOptions, DecorationOptions, DecorationRenderOptions, Range, ThemeColor, workspace } from "vscode";

export class Annotations {
  public static paramAnnotation(message: string, range: Range): DecorationOptions {

    const getConfiguration = (section: string): string =>
      workspace.getConfiguration("jsannotations").get(section);

    return {
      range,
      renderOptions: {
        before: {
          backgroundColor: new ThemeColor("jsannotations.annotationBackground"),
          borderRadius: getConfiguration("borderRadius") + "px",
          color: new ThemeColor("jsannotations.annotationForeground"),
          contentText: message,
          fontStyle: getConfiguration("fontStyle"),
          fontWeight: getConfiguration("fontWeight")
        }
      } as DecorationRenderOptions
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
