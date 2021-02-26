/* eslint-disable immutable/no-this */
import {memo, PureComponent, useState} from "react";
import {useTranslation} from "react-i18next";
import {Flex} from "../../styled/flex";
import {Typography, Button, Result, Input, Radio, Avatar, Space, message} from "antd";
import {FrownOutlined, ReloadOutlined, SendOutlined} from "@ant-design/icons";
import styled from "styled-components";
import {useQuery} from "react-query";
import {useDataMutation} from "../../hooks/useDataMutation";
import {useGlobalState} from "../../hooks/useGlobalState";
import {getImageLink} from "Helper";

const {TextArea} = Input;
const {Title} = Typography;

const ErrorContainer = styled.div`
    width: 500px;
`;

const developers = ["andrei", "xiaohu", "haonan"];

const Complaint = memo(() => {
    const {t} = useTranslation();
    const [developer, setDeveloper] = useState();
    const [sending, setSending] = useState(false);
    const [description, setDescription] = useState("");
    const {data: devs} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
        select: users => users.filter(user => developers.includes(user.login)),
    });
    const {mutate: sendNotification} = useDataMutation("/notifications/sendNotification", {
        onSuccess: () => {
            message.success(t("error.complaint.successMessage"));
            setSending(false);
            setDeveloper(null);
            setDescription("");
        },
    });
    const [user] = useGlobalState("user");
    return (
        <ErrorContainer>
            <Title level={4}>{t("error.complaint.title")}</Title>
            <Radio.Group onChange={e => setDeveloper(e.target.value)} value={developer}>
                {devs.map(dev => (
                    <Radio key={dev._id} value={dev.login}>
                        <Space>
                            <Avatar
                                shape="square"
                                size="large"
                                src={getImageLink(dev.avatar, "avatar_webp", dev.session)}
                            />
                            {dev.name}
                        </Space>
                    </Radio>
                ))}
            </Radio.Group>
            <TextArea
                placeholder="?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{margin: "1rem 0"}}
            />
            <Flex rowReverse>
                <Button
                    onClick={() => {
                        setSending(true);
                        sendNotification({
                            description: `New complaint from ${user.name ?? user.login}: [${
                                devs.find(dev => dev.login === developer).name
                            }]

${description}`,
                            receivers: ["andrei"],
                        });
                    }}
                    icon={<SendOutlined />}
                    loading={sending}
                    type="primary"
                    disabled={developer == null || description.length === 0}
                >
                    {t("error.complaint.send")}
                </Button>
            </Flex>
        </ErrorContainer>
    );
});

const DefaultError = memo(({path}) => {
    const {t} = useTranslation();
    const [complaining, setComplaining] = useState(false);
    return (
        <Flex style={{height: "100%"}} justifyAround alignCenter>
            <Result
                status="500"
                title={t("error.error")}
                subTitle={t("error.description")}
                extra={[
                    <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={() => {
                            window.location.replace(`/${path}`);
                        }}
                    >
                        {t("error.buttonName")}
                    </Button>,
                    !complaining ? (
                        <Button icon={<FrownOutlined />} onClick={() => setComplaining(true)}>
                            {t("error.complaint.complainButton")}
                        </Button>
                    ) : (
                        <Button onClick={() => setComplaining(false)}>{t("error.complaint.cancel")}</Button>
                    ),
                ]}
            >
                {complaining && <Complaint />}
            </Result>
        </Flex>
    );
});

export class ErrorBoundary extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return {hasError: true};
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return this.props.fallback ?? <DefaultError />;
        }

        return this.props.children;
    }
}
