const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const path = require("path");

const isProd = process.env.NODE_ENV === "production";

/** @type { import('webpack').Configuration } */
module.exports = {
    entry: "./src/index.ts",
    devtool: "source-map",
    mode: isProd ? "production" : "development",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.[hash].js",
        clean: true,
    },
    optimization: {
        minimize: isProd,
        minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
    },

    module: {
        rules: [
            {
                test: /\.(ts|tsx)?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js", ".json", ".tsx"],
    },
    devServer: {
        port: 9999,
        open: true,
        hot: true,
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [{ from: "public", filter: (filepath) => !filepath.endsWith("index.html") }],
        }),

        new HtmlWebpackPlugin({
            template: "public/index.html",
            hash: true, // cache busting
            filename: "../dist/index.html",
            minify: isProd,
        }),
    ],
};
