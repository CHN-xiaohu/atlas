import {useCallback} from "react";
import axios from "axios";
import {benchmark, getReadableFileSizeString, getServerUrl, isProduction, jsondata} from "../Helper";
import {useGlobalState} from "./useGlobalState";
import {useSocket} from "./useSocket";

const generateId = (() => {
    // eslint-disable-next-line immutable/no-let
    let counter = 0;
    return () => counter++;
})();

const baseURL = getServerUrl()

export const {post, get} = axios.create({
    baseURL,
    responseType: "json",
});

const transports = {
    axios: async (endpoint, session, data) => {
        const finishBenchmark = benchmark();
        const response = await post(endpoint, data, {
            headers: {
                Authorization: session
            }
        });
        finishBenchmark(
            `[${generateId()}] ${endpoint} ${getReadableFileSizeString(response.headers["content-length"])}`,
        );
        return response.data;
    },
    fetch: async (endpoint, session, data) => {
        const requestBenchmark = benchmark();
        const response = await fetch(
            `${baseURL}${endpoint}`,
            jsondata(data, {
                Authorization: session
            }),
        );
        const requestBenchmarkResult = requestBenchmark();
        const size = response.headers.get("content-length");
        const parseJSONBenchmark = benchmark();
        const json = await response.json();
        parseJSONBenchmark(
            `[${generateId()}] ${endpoint} [fetch] ${requestBenchmarkResult}ms [size] ${getReadableFileSizeString(
                size,
            )} [json.parse]`,
        );
        return json;
    },
    sockets: async (url, session, data, socket) => {
        const [, endpoint, method] = url.split("/");
        const bm = benchmark();
        const response = await new Promise((resolve, reject) => {
            socket.emit(
                "request",
                {
                    endpoint,
                    method,
                    ...data,
                },
                data => resolve(data),
            );
        });
        bm(`[${generateId()}] ${url} [socket.io]`);
        return response;
    },
};

const defaultTransport = localStorage.getItem('transport') ?? (isProduction() ? 'sockets': 'axios');

export const useRequest = (endpoint, transport = defaultTransport) => {
    const [user] = useGlobalState('user');
    const session = user?.session;
    const {socket} = useSocket();
    return useCallback(
        async (e, d = null, trans) => {
            try {
                const endpointX = endpoint ?? e;
                const dataX = endpoint == null ? d : e;
                return await transports[trans ?? transport](endpointX, session, dataX, socket);
            } catch (e) {
                console.log(e);
                throw e;
            }
        },
        [endpoint, transport, socket, session],
    );
};
