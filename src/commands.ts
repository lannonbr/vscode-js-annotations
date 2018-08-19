import * as vscode from "vscode";

export default class Commands {

  static registerCommands() {

    // Command to hide / show annotations
    vscode.commands.registerCommand('jsannotations.toggle', () => {
      let currentState = vscode.workspace.getConfiguration('jsannotations').get('enabled');
      vscode.workspace.getConfiguration('jsannotations').update('enabled', !currentState, true);
    })

  }

}