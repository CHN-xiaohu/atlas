/** @jsxImportSource @welldone-software/why-did-you-render */
import React from "react";
const enable = localStorage.getItem('whyDidYouRender');
if (process.env.NODE_ENV === "development" && enable != null) {
    const whyDidYouRender = require("@welldone-software/why-did-you-render");
    whyDidYouRender(React, {
        trackAllPureComponents: true,
        //collapseGroups: true,
        exclude: [/Draggable/, /^AnimateInOut$/],
        logOnDifferentValues: false,
    });
}
