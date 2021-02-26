import {useContext, useEffect, useRef} from "react";
import {SocketIOContext} from "./sockets/context";

export const useSocket = (eventKey, callback) => {
    const socket = useContext(SocketIOContext);
    const callbackRef = useRef(callback);

    callbackRef.current = callback;

    const socketHandlerRef = useRef((...args) => {
        if (callbackRef.current) {
            callbackRef.current(...args);
        }
    });

    const subscribe = () => {
        if (eventKey) {
            socket.on(eventKey, socketHandlerRef.current);
        }
    };

    const unsubscribe = () => {
        if (eventKey) {
            socket.removeListener(eventKey, socketHandlerRef.current);
        }
    };

    useEffect(() => {
        subscribe();

        return unsubscribe;
        // eslint-disable-next-line
    }, [eventKey]);

    return {socket, unsubscribe, subscribe};
};
