import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import nextPlugin from '@next/eslint-plugin-next';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    {
        files: ['**/*.{jsx,ts,tsx}'],
        ignores: ['node_modules/**', '.next/**', 'out/**', 'dist/**', 'build/**', '.turbo/**'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.es2021,
                ...globals.node,
            },
        },
        plugins: {
            '@typescript-eslint': typescript,
            'unused-imports': unusedImports,
            import: importPlugin,
            '@next/next': nextPlugin,
            prettier,
        },
        rules: {
            // TypeScript Rules
            'no-unused-vars': 'off',
            'unused-imports/no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    args: 'after-used',
                    argsIgnorePattern: '^_.*?$',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                    caughtErrors: 'all',
                },
            ],

            // Import Rules
            'unused-imports/no-unused-imports': 'warn',
            'import/order': [
                'warn',
                {
                    groups: [
                        'type',
                        'builtin',
                        'object',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                    ],
                    pathGroups: [
                        {
                            pattern: '~/**',
                            group: 'external',
                            position: 'after',
                        },
                    ],
                    'newlines-between': 'always',
                },
            ],

            // Next.js Rules
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,
            '@next/next/no-html-link-for-pages': 'error',
            '@next/next/no-img-element': 'warn',

            // Base Rules
            'prettier/prettier': 'error',
        },
    },
]);
