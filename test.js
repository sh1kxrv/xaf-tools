const included = /(.*(vue|tsx|jsx|js|ts))/i;
const files = [
  "test/test/test/test.file.vue",
  "ssss.vue",
  "test.tt.ts",
  "tttt.js",
  "index.vue",
  "readme.md",
];
const excluded = ["index.ts", "index.js", "index.vue"];

(() => {
  const filtered = files.filter(
    (file) => included.test(file) && !excluded.includes(file)
  );
  console.log(filtered);
})();
