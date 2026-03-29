const { getDefaultConfig } = require('@expo/metro-config');

// Archivo creado para solucionar problemas de compatibilidad con exportacion de paquetes

const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.sourceExts.push('cjs');
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;
