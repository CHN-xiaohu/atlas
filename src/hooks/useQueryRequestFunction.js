import {useCallback, useState, useEffect} from "react";
import {useRequest} from "./useRequest";
import {useGlobalState} from "./useGlobalState";
import {Space, message, Modal, Input, Typography, Button} from "antd";
import {request} from "../Helper";
import moment from "moment";
import NProgress from "accessible-nprogress";
import {useTranslation} from "react-i18next";
import "accessible-nprogress/dist/accessible-nprogress.min.css";

const {Text} = Typography;

NProgress.configure({showSpinner: false, parent: "#root"});
const notNull = x => x != null;

const SEND_CODE_INTERVAL = 60;

const LoginModalContent = ({user, setUser, resolve}) => {
    const [code, setCode] = useState("");
    const [timer, setTimer] = useState(0);
    const {t} = useTranslation();

    const handleSendCode = async () => {
        await request("https://api.globus.furniture/users/sendAuthCode", {login: user.login});

        setTimer(SEND_CODE_INTERVAL);
        const intervalHandle = setInterval(() => {
            setTimer(timer => {
                const result = timer - 1;

                if (result > 0) return result;

                clearInterval(intervalHandle);
                return 0;
            });
        }, 1000);
    };

    const handleLogin = async () => {
        const response = await request("https://api.globus.furniture/users/auth", {
            login: user.login,
            code,
        });

        if (response.error != null) {
            message.error(response.error);
        } else {
            setUser(response);
            localStorage.setItem("user", JSON.stringify(response));
            resolve();
            window.location.reload();
        }
    };

    useEffect(() => {
        handleSendCode();
        // eslint-disable-next-line
    }, []);

    return (
        <div>
            <Text>
                {t("hooks.yourLoginHasExpiredAndANewEnterpriseWeChatAuthenticationCodeHasBeenSentPleaseLogInAgain")}
            </Text>
            <Space>
                <Input
                    placeholder={t("hooks.enterpriseWeChatVerificationCode")}
                    onChange={e => {
                        setCode(e.target.value);
                    }}
                />
                {timer > 0 ? (
                    <Button disabled={true}>
                        {t("hooks.resend")}({timer})
                    </Button>
                ) : (
                    <Button onClick={handleSendCode}>{t("hooks.resend")}</Button>
                )}
                <Button type="primary" disabled={!code} onClick={handleLogin}>
                    {t("hooks.login")}
                </Button>
            </Space>
        </div>
    );
};

const showLoginModal = (() => {
    // eslint-disable-next-line immutable/no-let
    let showing = false;

    return ({user, setUser}) => {
        return new Promise(resolve => {
            if (showing === true) {
                resolve();
                return;
            }

            showing = true;

            const modal = Modal.warning({
                keyboard: false,
                mask: true,
                maskClosable: false,
                icon: null,
                okText: "切换账号",
                okButtonProps: {
                    size: "small",
                },
                onOk: () => {
                    setUser({});
                    localStorage.setItem("user", JSON.stringify({}));
                    window.location.replace("/login");
                },
                content: (
                    <LoginModalContent
                        user={user}
                        setUser={setUser}
                        resolve={() => {
                            resolve();
                            showing = false;
                            modal.destroy();
                        }}
                    />
                ),
            });
        });
    };
})();

export const useQueryRequestFunction = () => {
    const [user, setUser] = useGlobalState("user");
    const request = useRequest();
    // useEffect(() => {
    //     console.log('user change', user);
    // }, [user]);
    // useEffect(() => {
    //     console.log("session change", user?.session);
    // }, [user?.session]);
    return useCallback(
        async ({queryKey, pageParam}) => {
            const [endpoint, description] = queryKey;
            if (moment.unix(user.expire).isSameOrBefore(moment())) {
                showLoginModal({user, setUser});
            }

            const {method, transport, ...data} = description ?? {};
            const url = `/${[endpoint, method].filter(notNull).join("/")}`;

            NProgress.start();
            try {
                const response = await request(url, pageParam == null ? data : {...data, page: pageParam}, transport);

                if (typeof response === "object" && response?.error != null) {
                    if (typeof response.error === "string") {
                        if (response.error === "Session expired") {
                            showLoginModal({user, setUser});
                        }
                        console.error(url, response.error);
                        message.error(response.error);
                        throw new Error(response.error);
                    }
                }
                return response;
            } catch (e) {
                console.error(url, e);
                if (e.toString() === "Session expired") {
                    showLoginModal({user, setUser});
                }
                throw e;
            } finally {
                NProgress.done();
            }
        },
        [request, user, setUser],
    );
};
