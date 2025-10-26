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
        ignores: [
            'node_modules/**',
            '.next/**',
            'out/**',
            'dist/**',
            'build/**',
            '.turbo/**',
            'public/sw.js',
            'uploads/**',
        ],
    },
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
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
            '@next/next/google-font-display': 'warn',
            '@next/next/google-font-preconnect': 'warn',
            '@next/next/next-script-for-ga': 'warn',
            '@next/next/no-before-interactive-script-outside-document': 'error',
            '@next/next/no-css-tags': 'error',
            '@next/next/no-head-element': 'error',
            '@next/next/no-head-import-in-document': 'error',
            '@next/next/no-html-link-for-pages': 'error',
            '@next/next/no-img-element': 'warn',
            '@next/next/no-page-custom-font': 'warn',
            '@next/next/no-styled-jsx-in-document': 'error',
            '@next/next/no-sync-scripts': 'error',
            '@next/next/no-title-in-document-head': 'warn',
            '@next/next/no-typos': 'warn',
            '@next/next/no-unwanted-polyfillio': 'warn',

            // Base Rules
            'prettier/prettier': 'error',
        },
    },
]);
