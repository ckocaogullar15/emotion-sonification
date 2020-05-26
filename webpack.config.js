const HtmlWebpackPlugin = require("html-webpack-plugin");
const ProvidePlugin = require("webpack/lib/ProvidePlugin");

module.exports = {
  entry: "./src/main.ts",
  output: {
    publicPath: "/",
  },
  devServer: {
    historyApiFallback: true,
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      videojs: "video.js",
      WaveSurfer: "wavesurfer.js",
      RecordRTC: "recordrtc",
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["ts-loader"],
      },
      {
        test: /\.(html|css)$/,
        use: "raw-loader",
      },
    ],
  },
  plugins: [
    new ProvidePlugin({
      videojs: "video.js/dist/video.cjs.js",
      RecordRTC: "recordrtc",
    }),
    new HtmlWebpackPlugin({ template: "./src/index.html" }),
  ],
  node: {
    fs: "empty",
  },
};
