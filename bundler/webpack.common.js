const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

// const paths = {
//   source: path.join(__dirname, "../src"),
//   javascript: path.join(__dirname, "../src/js"),
//   images: path.join(__dirname, "../src/assets/img"),
//   svg: path.join(__dirname, "../src/assets/svg"),
//   models: path.join(__dirname, "../src/assets/models"),
//   build: path.join(__dirname, "../build"),
// };

module.exports = {
  entry: path.resolve(__dirname, "../src/script.js"),
  output: {
    filename: "bundle.[contenthash].js",
    path: path.resolve(__dirname, "../dist"),
  },
  devtool: "source-map",
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(__dirname, "../static") }],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../src/index.html"),
      favicon: path.resolve(__dirname, "../static/assets/images/sparkle.png"),
      minify: true,
    }),
    new MiniCSSExtractPlugin(),
  ],
  module: {
    rules: [
      // HTML
      {
        test: /\.(html)$/,
        use: ["html-loader"],
      },

      // JS
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },

      // CSS
      {
        test: /\.css$/,
        use: [MiniCSSExtractPlugin.loader, "css-loader"],
      },

      // Images
      {
        test: /\.(jpg|png|gif|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "assets/images/",
            },
          },
        ],
      },

      // Fonts
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "assets/fonts/",
            },
          },
        ],
      },
      // GLTF loader
      {
        test: /\.(glb|gltf)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "assets/models/",
            },
          },
        ],
      },
      // MTL/OBJ loader
      {
        test: /\.mtl$/,
        loader: "mtl-loader",
        options: {
          outputPath: "assets/models/",
        },
      },
      {
        test: /\.obj$/,
        loader: "url-loader",
        options: {
          outputPath: "assets/models/",
        },
      },
    ],
  },
};
