import * as process from 'node:process';
import * as path from 'node:path';
// @ts-ignore
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import AntdDayjsWebpackPlugin from 'antd-dayjs-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import type { Options as HtmlMinifierOptions } from 'html-minifier-terser';

const isDev: boolean = process.env.NODE_ENV === 'development';
const analyzer: boolean = process.env.ANALYZER === 'true';

// html代码压缩配置
const htmlWebpackPluginMinify: boolean | HtmlMinifierOptions = isDev ? false : {
  collapseWhitespace: true,
  keepClosingSlash: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
  minifyJS: {
    ecma: 2020,
    safari10: true
  }
};

/**
 * 模块使用node的commonjs的方式引入
 * @param { Array<string> } node: node模块名称
 */
function nodeExternals(node: Array<string>): { [k: string]: string } {
  const result: { [k: string]: string } = {};

  for (const name of node) {
    result[name] = `globalThis.require('${ name }')`;
  }

  return result;
}

/**
 * 为node原生模块添加"node:"
 * @param { Array<string> } node: node模块名称
 */
function nodeModules(node: Array<string>): Array<string> {
  return node.concat(node.map((o: string): string => `node:${ o }`));
}

const externalsName: Array<string> = nodeModules([
  'child_process',
  'crypto',
  'fs',
  'os',
  'path',
  'process',
  'util'
]).concat([
  'cron',
  'electron',
  'fs-extra',
  'got',
  'iconv-lite',
  'js-yaml',
  'nunjucks',
  'oicq'
]);

export default function(info: object): { [key: string]: any } {
  const plugins: Array<any> = [
    '@babel/plugin-syntax-import-assertions',
    [require.resolve(path.join(__dirname, '../babel-plugin-delay-require')), { moduleNames: externalsName }],
    !isDev && ['transform-react-remove-prop-types', { mode: 'remove', removeImport: true }]
  ].filter(Boolean);

  const config: { [key: string]: any } = {
    frame: 'react',
    dll: [
      '@indexeddb-tools/indexeddb',
      '@indexeddb-tools/indexeddb-redux',
      'classnames',
      'react',
      'react-dom/client',
      'prop-types',
      '@reduxjs/toolkit',
      'react-redux',
      'reselect',
      'react-router-dom'
    ],
    entry: {
      index: [path.join(__dirname, 'src/index.tsx')]
    },
    html: [{ template: path.join(__dirname, 'src/index.pug'), minify: htmlWebpackPluginMinify }],
    externals: {
      SDK: 'window.SDK',
      ...nodeExternals(externalsName)
    },
    javascript: {
      ecmascript: true,
      plugins,
      exclude: /node_modules|NIM_Web_SDK|BlythE/i
    },
    typescript: {
      configFile: isDev ? 'tsconfig.json' : 'tsconfig.prod.json',
      plugins,
      exclude: /node_modules|NIM_Web_SDK|BlythE/i
    },
    sass: {
      include: /src/
    },
    less: {
      exclude: /tailwindcss/i
    },
    rules: [
      {
        test: /NIM_Web_SDK/,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]' // TODO: js文件生成的hash和注入的hash不一致
        }
      },
      {
        test: /\.tailwindcss\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      }
    ],
    plugins: [new AntdDayjsWebpackPlugin()].concat(analyzer ? [new BundleAnalyzerPlugin()] : [])
  };

  return config;
}