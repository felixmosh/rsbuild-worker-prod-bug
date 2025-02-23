import { defineConfig } from '@rsbuild/core';
import { BannerPlugin, HotModuleReplacementPlugin } from '@rspack/core';
import { RunScriptWebpackPlugin } from 'run-script-webpack-plugin';

const assetPrefix = '/1.0.0';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  environments: {
    node: {
      source: {
        entry: {
          server: [
            isDev && './node_modules/@rspack/core/hot/poll?1000',
            './src/index.ts',
          ].filter(Boolean) as string[],
        },
      },
      output: {
        target: 'node',
        cleanDistPath: true,
        distPath: {
          root: 'dist',
          jsAsync: './server',
        },
        overrideBrowserslist: ['node >= 20'],
      },
    },
  },
  source: {
    decorators: { version: 'legacy' },
  },
  output: {
    charset: 'ascii',
  },
  tools: {
    rspack: (config, { isServer, isDev }) => {
      if (isServer) {
        if (isDev) {
          config.plugins?.push(
            new RunScriptWebpackPlugin({
              name: 'server.js',
              autoRestart: false,
            }),
            new HotModuleReplacementPlugin(),
            new BannerPlugin({
              banner: 'require("source-map-support").install();',
              raw: true,
              entryOnly: true,
            }),
          );

          config.devtool = 'inline-cheap-module-source-map';
          config.output = config.output || {};
          config.output.hotUpdateChunkFilename =
            'server/hot/[id].[fullhash].hot-update.js';
          config.output.hotUpdateMainFilename =
            'server/hot/[runtime].[fullhash].hot-update.json';
        } else {
          config.optimization = config.optimization || {};
          config.optimization.minimize = false;
          config.optimization.concatenateModules = true;
          config.optimization.removeEmptyChunks = true;
          config.optimization.innerGraph = true;
          config.optimization.mergeDuplicateChunks = true;
          config.optimization.sideEffects = true;
        }

        config.module = config.module || {}
        config.module.parser = config.module.parser || {}
        config.module.parser.javascript = config.module?.parser?.javascript || {}
        config.module.parser.javascript.worker = [
          'WorkerExtractor from ./WorkerExtractor',
          '...',
        ];

        config.externalsPresets = { node: true };
      }

      return config;
    },
  },
  dev: {
    assetPrefix,
    writeToDisk: true,
    client: {
      host: '127.0.0.1',
      port: '8080',
      protocol: 'ws',
      overlay: true,
    },
  },
  server: {
    port: 8080,
    publicDir: {
      copyOnBuild: false,
    },
  },
});
