import * as _fs from "fs";
import * as _path from "path";
import { File } from "./file";

import * as vscode from "vscode";

export enum FileType {
  JS = "js",
  TS = "ts",
}

const pascalCaseReg = /([A-Z][a-z0-9]+)+/;

/**
 * @returns {string}
 */
const toPascalCase = (str: string) => {
  const words = str.match(/[a-z]+/gi);
  if (!words) {
    return "";
  }
  return words
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
    })
    .join("");
};

export class IndexFileGenerator extends File {
  constructor(
    private readonly processDirectory: string,
    private readonly type: FileType = FileType.JS
  ) {
    super([]);
  }

  /**
   * Препроцесс имени файла
   * @returns {string}
   */
  private preprocess(filePath: string) {
    const name = _path.parse(filePath).name;
    return pascalCaseReg.test(name) ? name : toPascalCase(name);
  }

  private indexExists(filePath: string) {
    // const indexReg = /index\.(js|ts)$/g;
    const indexjs = _path.resolve(filePath, "index.js");
    const indexts = _path.resolve(filePath, "index.ts");
    return _fs.existsSync(indexjs) || _fs.existsSync(indexts);
  }

  private exportES6(name: string, filePath: string, isDirectory: boolean) {
    return isDirectory
      ? `export * from './${filePath}'`
      : `export { default as ${name} } from './${filePath}'`;
  }

  /**
   * Сгенерировать export 'линию'
   */
  private export(name: string, filePath: string) {
    const isDirectory = _fs.statSync(filePath).isDirectory();
    const relativePath = _path.relative(this.processDirectory, filePath);
    if (!this.indexExists(filePath) && isDirectory) {
      return `// : Directory './${relativePath}' have not index.js :`;
    }
    return this.exportES6(name, relativePath, isDirectory);
  }

  private readdir(): string[] {
    const included = /(.*(vue|tsx|jsx|js|ts|svelte))/i;
    const excluded = ["index.js", "index.ts", "index.vue", "index.svelte"];
    let files = _fs.readdirSync(this.processDirectory);
    if (files.length === 0) {
      vscode.window.showErrorMessage("Directory is empty!");
      return [];
    }
    return files.filter((file: string) => {
      const fullPath = _path.resolve(this.processDirectory, file);
      const fileStat = _fs.statSync(fullPath);
      return (
        (included.test(file) && !excluded.includes(file)) ||
        fileStat.isDirectory()
      );
    });
  }

  generate() {
    this.add("// : USE XAF-TOOLS TO REGENERATE IT :").skip();
    const files = this.readdir();
    for (const file of files) {
      try {
        const preprocessedName = this.preprocess(file);
        const resolvedPath = _path.resolve(this.processDirectory, file);
        const exportRow = this.export(preprocessedName, resolvedPath);
        this.add(exportRow);
      } catch (e: any) {
        this.add(`// : Error : ${e.message}`);
      }
    }

    _fs.writeFileSync(
      _path.resolve(this.processDirectory, `index.${this.type}`),
      this.get(),
      { encoding: "utf-8" }
    );

    vscode.window.showInformationMessage(`File index.${this.type} generated!`);
  }
}
