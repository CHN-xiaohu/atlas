import {useGlobalState} from "./useGlobalState";

export const useSocketStorage = (key, defaultValue) => {
    const [socketStorage] = useGlobalState('socket-storage');
    return socketStorage[key] ?? defaultValue;
}
