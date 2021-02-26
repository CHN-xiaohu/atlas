import io from "socket.io-client";
import {SocketIOContext} from "./context";
import {useRef} from "react";

export const SocketIOProvider = ({url, opts = {}, children}) => {
    const socketRef = useRef();

    if (typeof window === "undefined") {
        return children;
    }

    if (!socketRef.current || socketRef.current.io.opts !== opts) {
        console.log('socket reconnect')
        socketRef.current = io(url, opts);
    }

    return <SocketIOContext.Provider value={socketRef.current}>{children}</SocketIOContext.Provider>;
};
