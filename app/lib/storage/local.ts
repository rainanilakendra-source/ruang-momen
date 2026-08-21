import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export interface StorageProvider {
  save(key: string, data: Uint8Array): Promise<void>;
  delete(key: string): Promise<void>;
  read(key: string): Promise<Buffer>;
}

export class LocalStorage implements StorageProvider {
  private readonly root = path.resolve(process.cwd(), ".storage", "uploads");

  private resolveKey(key: string): string {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9/_-]*\.[a-z0-9]+$/.test(key)) {
      throw new Error("Invalid storage key");
    }

    const target = path.resolve(this.root, ...key.split("/"));
    if (!target.startsWith(`${this.root}${path.sep}`)) {
      throw new Error("Invalid storage key");
    }
    return target;
  }

  async save(key: string, data: Uint8Array): Promise<void> {
    const target = this.resolveKey(key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, data, { flag: "wx" });
  }

  async delete(key: string): Promise<void> {
    try {
      await rm(this.resolveKey(key));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }

  read(key: string): Promise<Buffer> {
    return readFile(this.resolveKey(key));
  }
}
