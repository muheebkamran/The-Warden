import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".agents/**",
    ".claude/**",
    ".cursor/**",
    ".devin/**",
    ".tmp/**",
    "3d-ui/**",
    "animate-expo/**",
    "animation-vocabulary/**",
    "directives/**",
    "emil-design-eng/**",
    "execution/**",
    "frontend-design/**",
    "skill-creator/**",
    "template/**",
    "theme-factory/**",
    "*.js",
  ]),
]);

export default eslintConfig;
