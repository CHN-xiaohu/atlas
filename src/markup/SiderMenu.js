import { memo } from "react";
import {Link} from "react-router-dom";
import {router} from "../router";
import {Menu, Space} from "antd";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "../hooks/useGlobalState";
const {Item} = Menu;

export const SiderMenu = memo(({collapsed, page}) => {
    const [user] = useGlobalState('user');
    const {t} = useTranslation();
    return (
        <Menu theme="light" className="menu" selectedKeys={[`/${page}`]}>
            {router
                .filter(route => route.accessLevel(user.group, user))
                .map(comp => {
                    const {name, icon: Icon, path} = comp;
                    return (
                        <Item title={t(name)} key={`/${path}`}>
                            <Link to={`/${path}`}>
                                <Space>
                                    <Icon />
                                    {!collapsed && t(name)}
                                </Space>
                            </Link>
                        </Item>
                    );
                })}
        </Menu>
    );
});
