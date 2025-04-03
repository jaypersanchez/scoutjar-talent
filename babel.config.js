module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'], // or use 'module:metro-react-native-babel-preset' if not using Expo
      plugins: [
        ['module:react-native-dotenv', {
          moduleName: '@env',
          path: '.env',
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        }]
      ]
    };
  };
  