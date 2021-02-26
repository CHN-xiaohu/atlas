import React from 'react'
import FlagIconFactory from 'react-flag-icon-css';
import {memo} from "react";

// Please only use `FlagIconFactory` one time in your application, there is no
// need to use it multiple times (it would slow down your app). You may place the
// line below in a `FlagIcon.js` file in your 'header' directory, then
// write `export default FlagIcon` as shown below and import it elsewhere in your app.
//const FlagIcon = FlagIconFactory(React);
// If you are not using css modules, write the following:
export const FlagIcon = memo(FlagIconFactory(React, { useCssModules: false })) //TODO somehow get rid of react import
