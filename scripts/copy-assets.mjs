// Uso: node scripts/copy-assets.mjs <pkgName> <file1> <file2> ...
// Copia arquivos de packages/<pkgName>/src/ para packages/<pkgName>/dist/
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const [pkg, ...files] = process.argv.slice(2);

if (!pkg || files.length === 0) {
  console.error("Uso: node copy-assets.mjs <pkgName> <file1> [file2] ...");
  process.exit(1);
}

for (const file of files) {
  const src = join(root, "packages", pkg, "src", file);
  const dst = join(root, "packages", pkg, "dist", file);
  await mkdir(dirname(dst), { recursive: true });
  await copyFile(src, dst);
  console.log(`copied: ${pkg}/src/${file} → ${pkg}/dist/${file}`);
}
