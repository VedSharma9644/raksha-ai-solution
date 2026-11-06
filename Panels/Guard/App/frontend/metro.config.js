const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
// Panels/Guard/App/frontend → repo root is four levels up
const monorepoRoot = path.resolve(projectRoot, '../../../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Root web panels hoist React 19.3.0 while Expo 57 needs 19.2.3 here.
// Force every import of `react` onto the app copy so hooks share one dispatcher.
const appReact = path.resolve(projectRoot, 'node_modules/react');
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  react: appReact,
};

module.exports = config;
