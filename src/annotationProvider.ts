import * as vscode from "vscode";

const annotationDecor: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType(
  {
    after: {
      margin: "0 0 0 3em",
      textDecoration: "none"
    },
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
  } as vscode.DecorationRenderOptions
);

export class Thing extends vscode.Disposable {
  private _editor: vscode.TextEditor | undefined;

  constructor() {
    super(() => this.dispose());
  }

  dispose() {
    this.clearAnnotations(this._editor);
  }

  clearAnnotations(editor: vscode.TextEditor | undefined) {
    if (editor === undefined || this._editor === undefined) return;
    editor.setDecorations(annotationDecor, []);
  }
}
