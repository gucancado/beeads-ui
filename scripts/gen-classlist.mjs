// Uso: node scripts/gen-classlist.mjs <pkgName>
// Extrai literais de string de packages/<pkg>/dist/index.{js,mjs} pra
// dist/classlist.txt — alvo estável de scan do Tailwind (v4 @source / v3 content).
// Superset é ok (tokens não-classe são ignorados pelo scanner); o gate é de
// COMPLETUDE: falha se as sentinelas do pacote não estiverem no manifesto.
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = process.argv[2];
if (!pkg) {
  console.error("Uso: node gen-classlist.mjs <pkgName>");
  process.exit(1);
}

// Sentinelas: classes que DEVEM existir no manifesto — pega regressão de
// shape do dist (code-split, minificação agressiva) no build do DS.
const SENTINELS = {
  ui: ["h-svh", "max-w-[85vw]", "data-[checked]:bg-primary"],
  charts: ["3xl:grid-cols-6"],
};

const tokens = new Set();
const collect = (raw) => {
  for (const t of raw.split(/\s+/)) {
    if (t && t.length <= 200) tokens.add(t);
  }
};

for (const file of ["index.js", "index.mjs"]) {
  const src = await readFile(join(root, "packages", pkg, "dist", file), "utf8");
  // Literais com aspas duplas e simples (com escapes)
  for (const m of src.matchAll(/"((?:[^"\\\n]|\\.)*)"/g)) collect(m[1]);
  for (const m of src.matchAll(/'((?:[^'\\\n]|\\.)*)'/g)) collect(m[1]);
  // Chunks cozidos de template literals (remove interpolações ${...})
  for (const m of src.matchAll(/`((?:[^`\\]|\\.)*)`/g)) {
    collect(m[1].replace(/\$\{[^}]*\}/g, " "));
  }
}

const sorted = [...tokens].sort();
const missing = (SENTINELS[pkg] ?? []).filter((s) => !tokens.has(s));
if (missing.length > 0) {
  console.error(`gen-classlist(${pkg}): sentinelas ausentes: ${missing.join(", ")}`);
  process.exit(1);
}

const out = join(root, "packages", pkg, "dist", "classlist.txt");
await writeFile(out, `${sorted.join("\n")}\n`, "utf8");
console.log(`gen-classlist(${pkg}): ${sorted.length} tokens → dist/classlist.txt`);
