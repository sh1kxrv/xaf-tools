import { FileType, IndexFileGenerator } from "./core/generator/file/index-file";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const disposableGenerateJs = vscode.commands.registerCommand(
    "xaf-tools.generate.js",
    async (folder: vscode.Uri) => {
      const generator = new IndexFileGenerator(folder.fsPath);
      generator.generate();
    }
  );

  const disposableGenerateTs = vscode.commands.registerCommand(
    "xaf-tools.generate.ts",
    async (folder: vscode.Uri) => {
      const generator = new IndexFileGenerator(folder.fsPath, FileType.TS);
      generator.generate();
    }
  );

  context.subscriptions.push(disposableGenerateJs, disposableGenerateTs);
}

export function deactivate() {}
