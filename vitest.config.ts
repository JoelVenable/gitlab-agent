import { defineConfig } from 'vitest/config'

const coverageEnabled = process.argv.includes('--coverage')

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      enabled: coverageEnabled,
      reporter: ['cobertura'],
      provider: 'istanbul',
      reportsDirectory: 'coverage',
    },
  },
  plugins: [],
})
