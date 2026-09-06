import { configApp } from '@adonisjs/eslint-config'

export default configApp(
  {
    name: 'Inertia TypeScript files',
    files: ['inertia/**/*.ts', 'inertia/**/*.js'],
  },
  {
    // @adonisjs/eslint-config 3.1 started matching `inertia/**/*.vue`, but the
    // Vue rules live in a separate `@adonisjs/eslint-config/vue` export that
    // needs vue-eslint-parser. Without it ESLint parses SFCs as TypeScript and
    // every file fails at `<template>`. Adopting that ruleset is a separate
    // change: it reports 1127 problems across the 92 components here.
    name: 'Vue SFCs (not yet linted)',
    ignores: ['**/*.vue'],
  }
)
