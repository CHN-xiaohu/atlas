import {useHistory} from "react-router-dom";
import moment from "moment";
import {Avatar, Button, Cascader, DatePicker, Divider, message, Space} from "antd";
import {LockOutlined, LogoutOutlined, UnlockOutlined, SettingOutlined} from "@ant-design/icons";
import {memo, useState} from "react";
import {LogList} from "./logs/List";
import {MenuHeader} from "../common/MenuHeader";
import {useRequest} from "../../hooks/useRequest";
import {useTranslation} from "react-i18next";
import {LimitedView} from "../common/LimitedView";
import {useGlobalState} from "../../hooks/useGlobalState";
import {EditUserModal} from "./EditUserModal";
import {Access} from "./Access";
import {getImageLink} from "Helper";
import {useQuery} from "react-query";
import {useDataMutation} from "../../hooks/useDataMutation";
import {useQueryClient} from "react-query";

const {RangePicker} = DatePicker;

const options = t => {
    return [
        {
            label: t("users.leads"),
            value: "lead",
        },
        {
            label: t("users.tasks"),
            value: "task",
        },
        {
            label: t("users.notes"),
            value: "note",
        },
        {
            label: t("users.products"),
            value: "product",
            children: [
                {
                    label: t("users.add"),
                    value: "add",
                },
                {
                    label: t("users.change"),
                    value: "change",
                },
                {
                    label: t("users.delete"),
                    value: "delete",
                },
            ],
        },
        {
            label: t("users.suppliers"),
            value: "supplier",
        },
        {
            label: t("users.whatsappMessages"),
            value: "waMessages",
        },
        {
            label: t("users.whatsappChats"),
            value: "waChats",
        },
        {
            label: t("users.quotations"),
            value: "quotation",
        },
    ];
};

const EditAll = ({onClose, user}) => {
    const queryClient = useQueryClient();
    const {mutate: changeAll} = useDataMutation("/users/changeAll", {
        onSuccess: () => {
            queryClient.invalidateQueries("users");
        },
    });
    return (
        <EditUserModal
            fields={["avatar", "name", "shortName", "title", "qiyeweixin"]}
            setVisible={onClose}
            user={user}
            onChange={(key, value) => {
                console.log(key, value);
                if (key === "avatar") {
                    console.log();
                    changeAll({login: user.login, key, value: value.length === 0 ? null : value[0]});
                } else {
                    changeAll({login: user.login, key, value});
                }
            }}
        />
    );
};

export const UserPanel = memo(({login}) => {
    const block = useRequest("/users/block");
    const kick = useRequest("/users/logout");
    const history = useHistory();
    const [range, setRange] = useState([moment().startOf("day"), moment().endOf("day")]);
    const [category, setCategory] = useState([]);
    const [visible, setVisible] = useState(false);
    const [accessVisible, setAccessVisible] = useState(false);
    const {t} = useTranslation();

    const [loginUser] = useGlobalState("user");
    const {data: users, isSuccess} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const {data: userInfo} = useQuery(
        [
            "users",
            {
                method: "byLogin",
                login,
            },
        ],
        {
            placeholderData: {},
        },
    );
    if (!isSuccess) {
        return "Loading...";
    }
    const user = users.find(u => u.login === login);
    if (user == null) {
        return "error";
    }

    return (
        <>
            <MenuHeader
                subTitle={t(`pages.${user.title}`)}
                onBack={() => history.goBack()}
                title={
                    <Space>
                        <Avatar src={getImageLink(user?.avatar, "avatar_webp", loginUser?.session)} size={50} />
                        {user.name}
                    </Space>
                }
                extra={[
                    <LimitedView key="logout" groups={[(g, user) => user?.access?.users?.canKickUsers]}>
                        <Button
                            onClick={async () => {
                                const {status} = await kick({login: user.login});
                                message.success(status);
                            }}
                            icon={<LogoutOutlined />}
                        >
                            {t("users.logout")}
                        </Button>
                    </LimitedView>,
                    <LimitedView key="access" groups={[(g, user) => user?.access?.users?.canEditAll]}>
                        <Button
                            type="primary"
                            onClick={() => {
                                setAccessVisible(true);
                            }}
                            icon={<SettingOutlined />}
                        >
                            {t("users.access")}
                        </Button>
                        {accessVisible && <Access onClose={() => setAccessVisible(false)} user={userInfo} />}
                    </LimitedView>,
                    <LimitedView key="edit" groups={[(g, user) => user?.access?.users?.canEditAll]}>
                        <Button
                            type="primary"
                            onClick={() => {
                                setVisible(true);
                            }}
                            icon={<SettingOutlined />}
                        >
                            {t("markup.edit")}
                        </Button>
                        {visible && <EditAll onClose={() => setVisible(false)} user={user} />}
                    </LimitedView>,
                    <LimitedView key="banorunban" groups={[(g, user) => user?.access?.users?.canBlockUsers]}>
                        {user.banned ? (
                            <Button
                                icon={<UnlockOutlined />}
                                type="primary"
                                onClick={() => block({login: user.login, value: false})}
                            >
                                {t("users.unblock")}
                            </Button>
                        ) : (
                            <Button
                                type="danger"
                                onClick={() => block({login: user.login, value: true})}
                                icon={<LockOutlined />}
                            >
                                {t("users.block")}
                            </Button>
                        )}
                    </LimitedView>,
                ]}
            >
                <Space>
                    <Button onClick={() => setRange([moment().add(-1, "month").startOf("day"), moment().endOf("day")])}>
                        {t("users.lastMonth")}
                    </Button>
                    <Button onClick={() => setRange([moment().add(-1, "week").startOf("day"), moment().endOf("day")])}>
                        {t("users.lastWeek")}
                    </Button>
                    <Button
                        onClick={() =>
                            setRange([moment().add(-1, "day").startOf("day"), moment().add(-1, "day").endOf("day")])
                        }
                    >
                        {t("users.yesterday")}
                    </Button>
                    <Button onClick={() => setRange([moment().startOf("day"), moment().endOf("day")])}>
                        {t("users.today")}
                    </Button>
                    <RangePicker
                        value={range}
                        onChange={range => {
                            const [start, end] = range;
                            setRange([start.startOf("day"), end.endOf("day")]);
                        }}
                        allowClear={false}
                        showTime={false}
                    />
                    <Cascader options={options(t)} value={category} onChange={setCategory} changeOnSelect />
                </Space>
            </MenuHeader>
            <Divider />
            <LogList user={user.login} from={range[0]} to={range[1]} type={category[0]} event={category[1]} />
        </>
    );
});
