import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import obsidianmd from "eslint-plugin-obsidianmd";

export default [
	/**
	 * 1️⃣ TypeScript source files
	 * Apply all obsidianmd rules + type-aware TS rules
	 */
	{
		files: ["**/*.ts"], // only lint TS source files
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: "./tsconfig.json",      // type info
				tsconfigRootDir: process.cwd(),  // resolve tsconfig correctly
				sourceType: "module",
			},
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
			obsidianmd,
		},
		rules: {
			// obsidianmd recommended rules
			...Object.fromEntries(
				Object.entries(obsidianmd.rules).map(([name]) => [`obsidianmd/${name}`, "error"])
			),
			// TS type-aware rules
			"@typescript-eslint/no-deprecated": "warn",
			"@typescript-eslint/consistent-type-imports": "error",
			"@typescript-eslint/no-unused-vars": "warn",
		},
	},

	/**
	 * 2️⃣ ESLint config / JS files
	 * Exclude type-aware TS rules
	 */
	{
		files: ["eslint.config.js", "eslint.config.mjs"],
		rules: {
			// only basic ESLint rules apply
		},
	},

	/**
	 * 3️⃣ Optional: Markdown or other plugin files
	 * Apply obsidianmd rules without TypeScript type checking
	 */
	{
		files: ["**/*.md"], // optional
		plugins: { obsidianmd },
		rules: {
			// only non-type-aware obsidian rules
			"obsidianmd/sample-names": "off",
			"obsidianmd/prefer-file-manager-trash-file": "warn",
		},
	},
];

