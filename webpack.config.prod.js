// required for path resolution for dist folder
const path = require("path");
// used to access the BannerPlugin
const webpack = require("webpack");
// required for pretty format for the Userscript banner
const stripIndent = require("common-tags").stripIndent;

module.exports = {
  entry: "./src/userscript.ts",
  devtool: "hidden-source-map",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        use: "html-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: "css-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "userscript.js",
  },
  plugins: [
    new webpack.BannerPlugin({
      raw: true,
      banner: stripIndent`
        // ==UserScript==
        // @name         Wanikani Integrated Custom SRS
        // @namespace    http://tampermonkey.net/
        // @version      0.3.2
        // @description  Adding custom cards to your review queue
        // @author       Gorbit99
        // @include      /^https?://((www|preview).)?wanikani.com/
        // @icon         https://www.google.com/s2/favicons?domain=wanikani.com
        // @grant        GM.xmlHttpRequest
        // @connect      jisho.org
        // @run-at       document-body
        // ==/UserScript==
      `,
    }),
  ],
  optimization: {
    minimize: false,
  },
  experiments: {
    topLevelAwait: true,
  },
};
