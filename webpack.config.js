const { merge } = require('webpack-merge');
const singleSpaDefaults = require('webpack-config-single-spa-react-ts');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: 'amg',
    projectName: 'navbar',
    webpackConfigEnv,
    argv
  });

  return merge(defaultConfig, {
    resolve: {
      fallback: {
        fs: false
      }
    },
    plugins: [new NodePolyfillPlugin()]
  });
};
