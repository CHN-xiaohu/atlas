import {useState, useEffect} from "react";

/**
 * @param {*} value
 */
export const useInnerState = (value) => {
    const [innerState, setInnerState] = useState(value);

    useEffect(() => {
        setInnerState(value);
    // eslint-disable-next-line
    }, [value]);

    return [innerState, setInnerState];
};
