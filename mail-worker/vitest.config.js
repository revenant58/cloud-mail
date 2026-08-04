import { defineConfig } from 'vitest/config';

// Plain unit-test config: these tests exercise pure utilities and need no
// Workers bindings. Use `vitest run` (pnpm test:unit) to execute them.
export default defineConfig({
	test: {
		environment: 'node',
		include: ['test/**/*.spec.js'],
	},
});
