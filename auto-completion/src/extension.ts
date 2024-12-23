// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as os from "os";
import {
  commands,
  ExtensionContext,
  languages,
  StatusBarAlignment,
  window,
  workspace,
} from "vscode";

import { CompletionProvider } from "./completion";
import { FileInteractionCache } from "./file-interaction";
import { TemplateProvider } from "./template-provider";

import path from "path";
import { getLineBreakCount } from "./new-utils";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "vscode-terminal-reader" is now active!'
  );

  const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right);
  const fileInteractionCache = new FileInteractionCache();

  const templateDir = path.join(os.homedir(), ".twinny/templates") as string;
  const templateProvider = new TemplateProvider(templateDir);
  const completionProvider = new CompletionProvider(
    statusBarItem,
    fileInteractionCache,
    templateProvider,
    context
  );

  context.subscriptions.push
  (
    languages.registerInlineCompletionItemProvider(
      { pattern: "**" },
      completionProvider
    ),
  
    workspace.onDidChangeTextDocument((e) => {
      const changes = e.contentChanges[0];
      if (!changes) {
        return;
      }
      const lastCompletion = completionProvider.lastCompletionText;
      const isLastCompltionMultiline = getLineBreakCount(lastCompletion) > 1;
      completionProvider.setAcceptedLastCompletion(
        !!(
          changes.text &&
          lastCompletion &&
          changes.text === lastCompletion &&
          isLastCompltionMultiline
        )
      );
      const currentLine = changes.range.start.line;
      const currentCharacter = changes.range.start.character;
      fileInteractionCache.incrementStrokes(currentLine, currentCharacter);
    }),

     commands.registerCommand('auto-complete.helloWorld',async () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage('Hello World from auto-complete!');
        
    })

  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
