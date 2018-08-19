import { Range, DecorationInstanceRenderOptions, DecorationOptions, workspace } from "vscode";

export class Annotations {
  static paramAnnotation(message: string, range: Range): DecorationOptions {
    let lightColor = workspace.getConfiguration('jsannotations.colors').get('lightColor');
    let darkColor = workspace.getConfiguration('jsannotations.colors').get('darkColor');

    return {
      range,
      renderOptions: {
        light: {
          before: {
            color: lightColor
          }
        },
        dark: {
          before: {
            color: darkColor
          }
        },
        before: {
          contentText: message,
          fontStyle: "italic"
        }
      } as DecorationInstanceRenderOptions
    } as DecorationOptions;
  }
}
