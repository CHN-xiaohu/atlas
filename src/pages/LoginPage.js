import {memo, useEffect, useState} from "react";
import styled from "styled-components";
import {LockOutlined, UserOutlined, LoginOutlined, createFromIconfontCN} from "@ant-design/icons";
import {Alert, Button, Col, Form, Input, Row, message} from "antd";
import {useTranslation} from "react-i18next";
import {setGlobalState, useGlobalState} from "../hooks/useGlobalState";
import {request, color} from "../Helper";
import {useImmer} from "hooks/useImmer";
import {Flex} from "../styled/flex";

const SymbolIcon = createFromIconfontCN({
    scriptUrl: "//at.alicdn.com/t/font_2163069_qx3k2751c1.js",
});

const Error = styled.div`
    color: ${color("red", 3)};
`;

const SEND_CODE_INTERVAL = 60;

const LoginForm = memo(({onSubmit, onSendCode}) => {
    const {t} = useTranslation();

    const [formData, setFormData] = useImmer({});
    const [invalidations, setInvalidations] = useImmer({});

    const [sendTimer, setSendTimer] = useState(0);
    const [alreadySend, setAlreadySend] = useState(false);

    const setFormDataItem = (key, val) => {
        setFormData(draft => {
            draft[key] = val;
        });
    };

    const handleSendCode = async () => {
        setInvalidations(draft => {
            draft.login = !formData.login;
        });
        if (!formData.login) return;

        
        try {
            setAlreadySend(true);
            await onSendCode(formData); 
            setSendTimer(SEND_CODE_INTERVAL);
        } catch (e) {
            message.error(e.toString());
            setAlreadySend(false);
        }

        const intervalHandle = setInterval(() => {
            setSendTimer(val => {
                const result = val - 1;
                if (result <= 0) {
                    clearInterval(intervalHandle);
                    return 0;
                } else {
                    return result;
                }
            });
        }, 1000);
    };

    const handleSubmit = () => {
        setInvalidations(draft => {
            draft.login = !formData.login;
            draft.code = !formData.code;
        });
        if (!formData.login || !formData.code) return;

        onSubmit(formData);
    };

    return (
        <Form className="login-form">
            <Form.Item>
                <Input
                    value={formData.login ?? ""}
                    onChange={e => setFormDataItem("login", e.target.value)}
                    prefix={<UserOutlined />}
                    placeholder={t("pages.username")}
                    onPressEnter={handleSubmit}
                />
                {invalidations?.login && <Error>{t("pages.pleaseInputYourUsername")}</Error>}
            </Form.Item>
            <Form.Item>
                <Flex>
                    <div style={{flex: "1", marginRight: "1rem"}}>
                        <Input
                            value={formData.code ?? ""}
                            onChange={e => setFormDataItem("code", e.target.value)}
                            maxLength={6}
                            prefix={<LockOutlined />}
                            placeholder={t("pages.enterpriseWeChatVerificationCode")}
                            onPressEnter={handleSubmit}
                        />
                    </div>
                    <Button
                        style={{display: "flex", alignItems: "center"}}
                        icon={
                            <SymbolIcon type="icon-qiyeweixin" style={{display: "inline-flex", fontSize: "18px"}} />
                        }
                        onClick={handleSendCode}
                        disabled={alreadySend}
                    >
                        {t(alreadySend ? "pages.resend" : "pages.sendTheVerificationCode")} {sendTimer > 0 && `(${sendTimer})`}
                    </Button>
                </Flex>
                {invalidations?.code && <Error>{t("pages.pleaseEnterYourVerificationCode")}!</Error>}
            </Form.Item>
            <div style={{marginTop: "1rem"}}>
                <Button type="primary" size="large" icon={<LoginOutlined />} onClick={handleSubmit}>
                    {t("pages.login")}
                </Button>
            </div>
        </Form>
    );
});

export const LoginPage = memo(({location, history}) => {
    const [user] = useGlobalState("user");
    const from = new URLSearchParams(location.search).get("from");

    useEffect(() => {
        if (user?.session != null) {
            if (from != null) {
                history.push(from);
            } else {
                history.goBack();
            }
        }
    }, [user?.session, from, history]);

    const handleSendCode = async ({login}) => {
        await request("https://api.globus.furniture/users/sendAuthCode", {login});
    };

    const handleSubmit = async ({login, code}) => {
        request("https://api.globus.furniture/users/auth", {
            login,
            code,
        }).then(user => {
            setGlobalState('user', user);
            if (user.error == null) {
                localStorage.setItem("user", JSON.stringify(user));
                //invalidate caches
            }
        });
    };

    return (
        <Row gutter={[24, 24]}>
            <Col span={24}>
                <Row justify="center">
                    <Col span={8}>
                        <LoginForm onSubmit={handleSubmit} onSendCode={handleSendCode} />
                    </Col>
                </Row>
            </Col>
            {user.error && (
                <Col span={24}>
                    <Row justify="center">
                        <Col span={8}>
                            <Alert message={user.error.toString()} type="error" showIcon closable />
                        </Col>
                    </Row>
                </Col>
            )}
        </Row>
    );
});
