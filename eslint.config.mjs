import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default defineConfig([
	...nextVitals,
	...nextTs,
	{
		plugins: { 'simple-import-sort': simpleImportSort },
		rules: {
			// Groups: side effects, packages, aliases, parents, siblings
			'simple-import-sort/imports': [
				'error',
				{
					groups: [
						['^\\u0000'],
						['^react$', '^react', '^@?\\w'],
						['^(@root|types|data)(/.*)'],
						['^@/\\w'],
						['^\\.\\.(?!/?$)', '^\\.\\./?$'],
						['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
					],
				},
			],
			'simple-import-sort/exports': 'error',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
		},
	},
	globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', '_old/**']),
])
