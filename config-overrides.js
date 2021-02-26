const {override, fixBabelImports, addLessLoader, adjustWorkbox} = require("customize-cra");

module.exports = override(
    fixBabelImports("antd", {
        libraryName: "antd",
        libraryDirectory: "es",
        style: true,
    }),
    addLessLoader({
        lessOptions: {
            javascriptEnabled: true,
        },
    }),
    adjustWorkbox(wb => Object.assign(wb, {
            maximumFileSizeToCacheInBytes: 10_000_000
            // skipWaiting: true,
            // exclude: (wb.exclude || []).concat("index.html")
        })
    )
);
