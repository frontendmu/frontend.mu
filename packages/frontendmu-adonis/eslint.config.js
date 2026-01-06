import { configApp } from '@adonisjs/eslint-config'

export default configApp(
  {
    name: 'Inertia TypeScript files',
    files: ['inertia/**/*.ts', 'inertia/**/*.js'],
  }
)
