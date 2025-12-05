// Bootstrap para resolver paths de TypeScript en Node.js
const tsConfigPaths = require('tsconfig-paths');
const path = require('path');
const fs = require('fs');

// Leer tsconfig.scripts.json
const tsConfigPath = path.join(__dirname, '..', 'tsconfig.scripts.json');
const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));

const baseUrl = path.resolve(__dirname, '..', tsConfig.compilerOptions.baseUrl || '.');
const paths = tsConfig.compilerOptions.paths || {};

// Registrar los paths
tsConfigPaths.register({
  baseUrl,
  paths
});

