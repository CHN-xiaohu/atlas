import {useCallback, useState} from "react";

export const useToggle = defaultValue => {
    const [state, setState] = useState(defaultValue);
    return [
        state,
        useCallback((...args) => {
            if (args.length === 0) {
                setState(state => !state);
            } else {
                setState(...args);
            }
        }, []),
    ];
};
