import fs from "fs/promises";
import {createInterface} from "node:readline";
import {createReadStream} from "node:fs";

export async function processFile(
  filePath: string,
  onLine: (line: string, lineNumber: number) => void
): Promise<void> {
  const stream = createReadStream(filePath, { encoding: "utf8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let lineNumber = 0;
  for await (const line of rl) {
    onLine(line, ++lineNumber);
  }
}

export async function isFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}
