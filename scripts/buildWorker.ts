const rootDir = new URL("..", import.meta.url).pathname;
const distDir = `${rootDir}/dist`;
await Deno.mkdir(distDir, { recursive: true });

const apiDir = `${rootDir}/src/app/api`;
const workerFile = `${rootDir}/src/worker.ts`;
const workerDir = `${rootDir}/src/worker`;
const tmpDir = `${rootDir}/.tmp-build`;
await Deno.mkdir(tmpDir, { recursive: true });

await Deno.rename(apiDir, `${tmpDir}/api`);
await Deno.rename(workerFile, `${tmpDir}/worker.ts`);
await Deno.rename(workerDir, `${tmpDir}/worker`);
let nextBuild: Deno.CommandOutput;
try {
  nextBuild = await new Deno.Command("npx", {
    args: ["next", "build"],
    cwd: rootDir,
    stdout: "inherit",
    stderr: "inherit",
  }).output();
} finally {
  await Deno.rename(`${tmpDir}/api`, apiDir);
  await Deno.rename(`${tmpDir}/worker.ts`, workerFile);
  await Deno.rename(`${tmpDir}/worker`, workerDir);
  await Deno.remove(tmpDir, { recursive: true }).catch(() => {});
}
if (!nextBuild.success) {
  Deno.exit(nextBuild.code);
}

const workerOut = `${distDir}/worker.js`;
const bundle = await new Deno.Command("npx", {
  args: [
    "esbuild",
    "src/worker.ts",
    "--bundle",
    "--minify",
    "--format=esm",
    `--outfile=${workerOut}`,
    "--alias:next/server=./src/worker/nextServerShim.ts",
    "--alias:@=./src",
  ],
  cwd: rootDir,
  stdout: "inherit",
  stderr: "inherit",
}).output();
if (!bundle.success) {
  Deno.exit(bundle.code);
}
console.log(`Built ${workerOut} and static assets in ./out`);
