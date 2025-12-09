module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { 
      presets: ['@babel/preset-env', '@babel/preset-typescript', ['@babel/preset-react', { runtime: 'automatic' }]],
      plugins: [['babel-plugin-transform-vite-meta-env', { env: { VITE_API_BASE_URL: 'http://localhost:5000' } }]]
    }]
  }
}
