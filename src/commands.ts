import * as vscode from "vscode";

export default class Commands {

  public static registerCommands() {

    // Command to hide / show annotations
    vscode.commands.registerCommand("jsannotations.toggle", () => {
      const currentState = vscode.workspace.getConfiguration("jsannotations").get("enabled");
      vscode.workspace.getConfiguration("jsannotations").update("enabled", !currentState, true);
    });

  }

}
