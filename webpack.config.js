const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
    entry: "./src/index.ts",
    devtool: "source-map",
    mode: "development",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
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
        }),
    ],
};
