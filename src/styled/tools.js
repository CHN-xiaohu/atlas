import {curry} from "ramda";

export const is = curry((attr, styles, props) => (props[attr] ? styles : null));
export const not = curry((attr, styles, props) => (!props[attr] ? styles : null));

const and = (a, b) => a && b;
const or = (a, b) => a || b;

export const every = curry((attrs, styles, props) =>
    attrs.reduce((a1, a2) => and(props[a1], props[a2])) ? styles : null,
);
export const some = curry((attrs, styles, props) =>
    attrs.reduce((a1, a2) => or(props[a1], props[a2])) ? styles : null,
);
export const match = curry((attr, targetValue, styles, props) => (props[attr] === targetValue ? styles : null));
