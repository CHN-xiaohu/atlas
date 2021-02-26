import "./wdyr";
import {StrictMode, memo, useMemo} from "react";
import {render} from "react-dom";
import {getServerUrl, isProduction} from "./Helper";
import {ReactQueryDevtools} from "react-query/devtools";
import {QueryClient, QueryClientProvider} from "react-query";
import {useQueryRequestFunction} from "./hooks/useQueryRequestFunction";
import {setGlobalState, useGlobalState} from "./hooks/useGlobalState";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import {App} from "./App";
import {SocketIOProvider} from "./hooks/sockets/provider";
import {useSocket} from "./hooks/useSocket";
import {notification} from "antd";
import {produce} from "immer";

const IS_PRODUCTION = isProduction();

const defaultOptions = {
    queries: {
        refetchOnWindowFocus: false,
        notifyOnChangeProps: "tracked",
    },
};

const queryClient = new QueryClient({
    defaultOptions,
});

const setSocketStorage = value => setGlobalState("socket-storage", value);

const QueryWrapper = memo(({children}) => {
    const request = useQueryRequestFunction();
    const [settings] = useGlobalState("invalidateSettings");
    const endpointsToWatch = Object.keys(settings).filter(key => settings[key]);
    useSocket("invalidate", hashes => {
        hashes.forEach(hash => {
            if (endpointsToWatch.includes(hash)) {
                queryClient.invalidateQueries(hash);
            }
        });
    });
    useSocket("notification", ({message, description, duration = 4.5}) => {
        notification.open({
            message,
            description,
            duration,
        });
    });
    useSocket("socket-storage-replace", storage => {
        setSocketStorage(storage);
        if (!isProduction()) {
            console.log("socket storage init", storage);
        }
    });
    useSocket("socket-storage-change", ({key, value}) => {
        setSocketStorage(storage =>
            produce(storage, draft => {
                draft[key] = value;
            }),
        );
        if (!isProduction()) {
            console.log("socket storage update", key, value);
        }
    });
    useMemo(() => {
        queryClient.setDefaultOptions({
            ...defaultOptions,
            queries: {
                ...defaultOptions.queries,
                queryFn: request,
            },
        });
    }, [request]);

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
});

const server = getServerUrl();
const SocketWrapper = memo(({children}) => {
    const [user] = useGlobalState("user");
    const session = user?.session;
    const opts = useMemo(() => {
        return {
            transports: ["websocket", "polling"],
            query: {session},
        };
    }, [session]);
    return (
        <SocketIOProvider url={server} opts={opts}>
            {children}
        </SocketIOProvider>
    );
});

render(
    <StrictMode>
        <SocketWrapper>
            <QueryWrapper>
                {!IS_PRODUCTION && <ReactQueryDevtools initialIsOpen={false} />}
                <App />а
            </QueryWrapper>
        </SocketWrapper>
    </StrictMode>,
    document.getElementById("root"),
);

serviceWorkerRegistration.register({
    onUpdate: registration => {
        const waitingServiceWorker = registration.waiting;

        if (waitingServiceWorker) {
            waitingServiceWorker.addEventListener("statechange", event => {
                if (event.target.state === "activated") {
                    notification.info({
                        message: "Update available",
                        description: "Click to refresh",
                        onClick: () => window.location.reload(),
                        duration: 0,
                    });
                }
            });
            waitingServiceWorker.postMessage({type: "SKIP_WAITING"});
        }
    },
});
