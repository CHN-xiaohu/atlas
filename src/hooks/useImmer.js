import {produce} from "immer";
import {useCallback, useState} from "react";

export const useImmer = defaultValue => {
    const [state, setState] = useState(defaultValue);
    return [
        state,
        useCallback(
            (updater, forceNativeStateFunction = false) => {
                if (forceNativeStateFunction || typeof updater !== "function") {
                    setState(updater);
                } else {
                    setState(state => produce(state, updater));
                }
            },
            [],
        ),
    ];
};
