// Uso: node scripts/copy-assets.mjs <pkgName> <file1> <file2> ...
// Copia arquivos de packages/<pkgName>/src/ para packages/<pkgName>/dist/
//
// Caso especial: ao copiar `styles.css` do pacote `ui`, injeta `@source` no
// começo apontando pros bundles JS irmãos em dist/. Isso garante que o
// Tailwind v4 do app consumidor escaneie os componentes do @beeads/ui e
// gere as classes `data-[*]:...` que eles usam inline — sem que o consumidor
// precise adicionar `@source` manualmente.
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const [pkg, ...files] = process.argv.slice(2);

if (!pkg || files.length === 0) {
  console.error("Uso: node copy-assets.mjs <pkgName> <file1> [file2] ...");
  process.exit(1);
}

const SOURCE_INJECTION_TARGETS = {
  ui: {
    "styles.css": `@source "./index.js";\n@source "./index.mjs";\n\n`,
  },
};

for (const file of files) {
  const src = join(root, "packages", pkg, "src", file);
  const dst = join(root, "packages", pkg, "dist", file);
  await mkdir(dirname(dst), { recursive: true });
  const injection = SOURCE_INJECTION_TARGETS[pkg]?.[file];
  if (injection) {
    const original = await readFile(src, "utf8");
    await writeFile(dst, injection + original, "utf8");
    console.log(`copied + injected @source: ${pkg}/src/${file} → ${pkg}/dist/${file}`);
  } else {
    await copyFile(src, dst);
    console.log(`copied: ${pkg}/src/${file} → ${pkg}/dist/${file}`);
  }
}
