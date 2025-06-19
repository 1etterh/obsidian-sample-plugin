// build.js
require("esbuild")
	.build({
		entryPoints: ["main.ts"],
		bundle: true,
		outfile: "main.js",
		target: ["es2020"],
		format: "cjs",
		external: ["obsidian"], // 핵심!
	})
	.catch(() => process.exit(1));
