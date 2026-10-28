/** @type {import("prettier").Config} */
const config = {
  printWidth: 100,
  trailingComma: "all",
  plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
  importOrder: [
    "^react$",
    "^react/(.*)$",
    "^next$",
    "^next/(.*)$",
    "",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@/(?!.*\\.css$)(.*)$",
    "",
    "^[.](?!.*\\.css$)",
    "",
    "\\.css$",
  ],
  importOrderTypeScriptVersion: "6.0.0",
  tailwindStylesheet: "./src/app/globals.css",
  tailwindFunctions: ["cn"],
};

export default config;
