export class File {
  constructor(private file: string[]) {}

  protected add(str: string) {
    this.file.push(str);
    return this;
  }

  protected skip() {
    this.add("");
    return this;
  }

  protected get() {
    return this.file.join("\n");
  }
}
