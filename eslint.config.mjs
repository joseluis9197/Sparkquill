import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      /*
       * The underscore prefix is the standard signal for "this parameter
       * exists because the signature demands it, not because I forgot to use
       * it". React's useActionState imposes (prevState, formData) whether an
       * action needs them or not, and the alternative — contriving a use for
       * an argument to satisfy a linter — makes the code worse rather than
       * better.
       *
       * Only leading underscores are exempt, so a genuinely forgotten
       * variable is still reported.
       */
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The disposable Postgres cluster the integration tests use. It is a
    // vendor tarball with thousands of files in it, several of which are
    // JavaScript, and linting somebody else's database server produces
    // thirty-eight thousand warnings about code nobody here wrote.
    ".postgres/**",
  ]),
]);

export default eslintConfig;
