import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const readAppFile = (filename: string) => {
  return fs.readFileSync(`${__dirname}/../app${filename}`);
};
