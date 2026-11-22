import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(join(root, "web/package.json"));
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const temporary = mkdtempSync(join(tmpdir(), "freesolo-brand-"));
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}
try {
  const result = spawnSync(
    process.execPath,
    [join(root, "scripts/generate-brand.mjs")],
    {
      env: { ...process.env, BRAND_OUTPUT_DIR: temporary },
      encoding: "utf8",
      windowsHide: true,
    },
  );
  if (result.status !== 0)
    throw new Error(result.stderr || "Brand generation failed");
  const generated = files(temporary);
  const stale = [];
  for (const expected of generated) {
    const path = relative(temporary, expected);
    const actual = join(root, path);
    if (path.endsWith(".png")) {
      const options = { resolveWithObject: true };
      const [a, b] = await Promise.all([
        sharp(actual).ensureAlpha().raw().toBuffer(options),
        sharp(expected).ensureAlpha().raw().toBuffer(options),
      ]);
      if (
        a.info.width !== b.info.width ||
        a.info.height !== b.info.height ||
        !a.data.equals(b.data)
      )
        stale.push(path);
    } else if (
      // Text exports may be checked out with CRLF on Windows; compare content, not line endings.
      readFileSync(actual, "utf8").replace(/\r\n/g, "\n") !==
      readFileSync(expected, "utf8").replace(/\r\n/g, "\n")
    )
      stale.push(path);
  }
  if (stale.length)
    throw new Error(
      `Stale brand exports: ${stale.join(", ")}. Run node scripts/generate-brand.mjs and include the updated assets.`,
    );
  console.log(
    `Verified ${generated.length} brand exports against web/public/new-logo.png; working files unchanged.`,
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
