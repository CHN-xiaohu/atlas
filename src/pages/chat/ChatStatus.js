import {memo, useState} from "react";
import {Space, Tooltip, Button, Avatar, Image, Popconfirm} from "antd";
import {
    QrcodeOutlined,
    QuestionCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    StopOutlined,
    SelectOutlined,
    createFromIconfontCN,
    ApiOutlined,
    LogoutOutlined,
    SyncOutlined,
    BulbOutlined,
} from "@ant-design/icons";
import {useQuery} from "react-query";
import {useDataMutation} from "hooks/useDataMutation";
import {instanceByResponsible} from "pages/chat/WindowSidebar";
import {useSocketStorage} from "hooks/useSocketStorage";
import {LimitedView} from "pages/common/LimitedView";
import {capitalize, color, getImageLink} from "../../Helper";
import {Tag} from "antd";
import {useTranslation} from "react-i18next";
import styled from "styled-components";
const generateQrcodeRandomString = () => Math.random().toString().slice(2);

const CustomIcons = createFromIconfontCN({
    scriptUrl: [
        "//at.alicdn.com/t/font_2223590_rkogw8k7c9.js", // icon-javascript, icon-java, icon-shoppingcart (overrided)
    ],
});

const statuses = [
    {
        status: "authenticated",
        substatus: "normal",
        color: "green",
        icon: <CheckCircleOutlined />,
    },
    {
        status: "authenticated",
        substatus: "battery_low_1",
        color: "lime",
        icon: <CustomIcons type="icon-Battery2" />,
    },
    {
        status: "authenticated",
        substatus: "battery_low_2",
        color: "lime",
        icon: <CustomIcons type="icon-Battery2" />,
    },
    {
        status: "authenticated",
        substatus: "phone",
        color: "lime",
        icon: <ApiOutlined />,
    },
    {
        status: "got qr code",
        substatus: "expired",
        color: "cyan",
        icon: <QrcodeOutlined />,
    },
    {
        status: "got qr code",
        substatus: "normal",
        color: "blue",
        icon: <QrcodeOutlined />,
    },
    {
        status: "got qr code",
        substatus: "loading",
        color: "geekblue",
        icon: <QrcodeOutlined spin />,
    },
    {
        status: "init",
        substatus: "init",
        color: "yellow",
        icon: <WarningOutlined />,
    },
    {
        status: "loading",
        color: "red",
        icon: <StopOutlined />,
    },
    {
        status: "loading",
        substatus: "pairing",
        color: "volcano",
        icon: <ApiOutlined />,
    },
];

const StyledTag = styled(Tag)`
    margin-right: 0;
`;

const Signal = ({status}) => {
    console.log(status);
    const stat = status?.accountStatus ?? "default";
    const substatus = status?.statusData?.substatus ?? "default";
    const s = statuses.find(s => s.status === stat && s.substatus === substatus);
    const {t} = useTranslation();
    if (s == null) {
        console.log("new status", s);
    }
    return (
        <Tooltip title={t(`chat.tooltips.${stat}.${substatus}`)}>
            <StyledTag
                color={color(s?.color ?? "grey")}
                onClick={() => {
                    console.log(status);
                }}
            >
                <Space>
                    {s?.icon ?? <QuestionCircleOutlined />}
                    {t(`chat.labels.${stat}.${substatus}`)}
                </Space>
            </StyledTag>
        </Tooltip>
    );
};

const actionsMap = {
    learn_more: {
        hide: true,
    },
    logout: {
        icon: <LogoutOutlined />,
        danger: true,
    },
    retry: {
        icon: <SyncOutlined />,
    },
    takeover: {
        icon: <SelectOutlined />,
    },
};

const Actions = ({actions, instance}) => {
    const {mutate: postAction, isLoading} = useDataMutation("/waChats/action");
    const {t} = useTranslation();
    return (
        <Button.Group size="small">
            {Object.keys(actions)
                .filter(action => {
                    return actionsMap?.[action]?.hide !== true;
                })
                .map(action => {
                    const modifier = actionsMap[action];
                    const execAction = () => {
                        postAction({
                            instance,
                            action,
                        });
                    };

                    if (modifier?.danger) {
                        return (
                            <Popconfirm title={t("common.areYouSure")} onConfirm={execAction}>
                                <Tooltip title={t(`chat.actions.${action}`)}>
                                    <Button type="text" {...modifier} loading={isLoading} disabled={isLoading} />
                                </Tooltip>
                            </Popconfirm>
                        );
                    } else {
                        return (
                            <Tooltip title={t(`chat.actions.${action}`)}>
                                <Button
                                    type="text"
                                    onClick={execAction}
                                    icon={<BulbOutlined />}
                                    {...modifier}
                                    loading={isLoading}
                                    disabled={isLoading}
                                />
                            </Tooltip>
                        );
                    }
                })}
        </Button.Group>
    );
};

export const ChatStatus = memo(({login}) => {
    const {data: users} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });

    const whatsappStatuses = useSocketStorage("whatsapp-statuses");
    const user = (users ?? []).find(user => user.login === login);
    const instance = instanceByResponsible[login];
    const status = whatsappStatuses?.[instance] ?? null;
    const [qrcodeRandomString, setQrcodeRandomString] = useState(generateQrcodeRandomString());
    const [nextRefreshQrcodeTime, setNextRefreshQrcodeTime] = useState(0);

    const {data: qrcode} = useQuery(
        [
            "waChats",
            {
                method: "qrcode",
                instance,
                random: qrcodeRandomString,
            },
        ],
        {
            enabled: status != null && status.accountStatus === "got qr code",
            placeholderData: "",
        },
    );

    if (
        status?.accountStatus === "got qr code" &&
        status?.statusData?.substatus === "expired" &&
        new Date().getTime() > nextRefreshQrcodeTime
    ) {
        setQrcodeRandomString(generateQrcodeRandomString());
        setNextRefreshQrcodeTime(new Date().getTime() + 60000);
    }

    const actions = status?.statusData?.actions;

    return (
        status && (
            <Space>
                <Avatar shape="square" src={getImageLink(user?.avatar, "avatar_webp", user?.session)} />

                <Signal status={status}>{capitalize(status.accountStatus)}</Signal>

                {typeof actions === "object" && Object.keys(actions).length > 0 && (
                    <LimitedView groups={[(g, user) => user?.access?.whatsapp?.canOperateChats]}>
                        <Actions actions={actions} instance={instance} />
                    </LimitedView>
                )}

                {status.accountStatus === "got qr code" && (
                    <LimitedView groups={[(g, user) => user?.access?.whatsapp?.canLogin]}>
                        <Tooltip overlayStyle={{maxWidth: "none"}} trigger="click" title={<Image src={qrcode} />}>
                            <Button
                                disabled={status?.statusData?.substatus !== "normal"}
                                loading={status?.statusData?.substatus === "loading"}
                                type="text"
                                size="small"
                                icon={<QrcodeOutlined />}
                            />
                        </Tooltip>
                    </LimitedView>
                )}
            </Space>
        )
    );
});
