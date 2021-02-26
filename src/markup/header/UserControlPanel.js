import {memo, useState} from "react";
import {Avatar, Dropdown, Menu, Space} from "antd";
import {CloseOutlined, LogoutOutlined, UserOutlined, SettingOutlined} from "@ant-design/icons";
import {useGlobalState} from "../../hooks/useGlobalState";
import {useTranslation} from "react-i18next";
import styled from "styled-components";
import {getImageLink} from "Helper";
import {EditUserModal} from "../../pages/users/EditUserModal";
import {useDataMutation} from "../../hooks/useDataMutation";
import {useQueryClient} from "react-query";

const UserPanel = styled.div`
    cursor: pointer;
    transition: all 0.3s;
    padding: 0 10px;
    .ant-avatar {
        margin-right: 8px;
    }
    &:hover {
        background-color: rgba(0, 0, 0, 0.025);
    }
`;

const EditOneself = ({onClose, user}) => {
    const queryClient = useQueryClient();
    const {mutate: changeSelf} = useDataMutation("/users/changeSelf", {
        onSuccess: () => {
            queryClient.invalidateQueries("users");
        },
    });
    return (
        <EditUserModal
            fields={["avatar", "name", "shortName"]}
            setVisible={onClose}
            user={user}
            onChange={(key, value) => {
                if (key === "avatar") {
                    changeSelf({key, value: value.length === 0 ? null : value[0]});
                } else {
                    changeSelf({key, value});
                }
            }}
        />
    );
};

export const UserControlPanel = memo(() => {
    const {t} = useTranslation();

    const [user, setUser] = useGlobalState("user");
    const [visible, setVisible] = useState(false);

    return (
        <>
            <Dropdown
                mouseEnterDelay={0.15}
                mouseLeaveDelay={0.1}
                overlay={
                    <Menu>
                        {user?.access?.users?.canEditSelf && (
                            <Menu.Item
                                onClick={() => {
                                    setVisible(true);
                                }}
                            >
                                <Space>
                                    <SettingOutlined />
                                    <span>{t("markup.edit")}</span>
                                </Space>
                            </Menu.Item>
                        )}

                        <Menu.Item
                            onClick={() => {
                                setUser({});
                                localStorage.setItem("user", JSON.stringify({}));
                            }}
                        >
                            <Space>
                                <LogoutOutlined />
                                <span>{t("markup.exit")}</span>
                            </Space>
                        </Menu.Item>
                    </Menu>
                }
                placement="bottomLeft"
            >
                <UserPanel>
                    <Avatar src={getImageLink(user?.avatar, "avatar_webp", user?.session)} shape="circle">
                        {user.session == null ? <CloseOutlined /> : <UserOutlined />}
                    </Avatar>
                    {user?.name ?? user?.name ?? user?.login ?? t("markup.unauthorized")}
                </UserPanel>
            </Dropdown>
            {visible && <EditOneself onClose={() => setVisible(false)} user={user} />}
        </>
    );
});
