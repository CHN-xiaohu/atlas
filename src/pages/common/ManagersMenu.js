import {memo} from "react";
import {ButtonsMenu} from "./ButtonsMenu";
import {Avatar} from "antd";
import {TeamOutlined} from "@ant-design/icons";
import {useQuery} from "react-query";
import {useTranslation} from "react-i18next";
import {getImageLink, salesManager} from "../../Helper";

const defaultGroup = (_g, user) => salesManager(user);

export const ManagersMenu = memo(
    ({
        value,
        onClick,
        onChange,
        filter,
        showAllOption = true,
        group = defaultGroup,
        valueField = "login",
        showBanned = [],
        disabled = false,
        className,
        style,
    }) => {
        const {data: users} = useQuery(["users"], {
            placeholderData: [],
            staleTime: 4 * 60 * 60 * 1000,
            cacheTime: 4 * 60 * 60 * 1000,
        });
        const {t} = useTranslation();
        const salesManagers = users
            .filter(user => group(user.group, user) && (!user.banned || showBanned.includes(user.login)))
            .filter(filter ?? (() => true));
        const userOptions = salesManagers.map(manager => ({
            key: manager[valueField],
            icon: (
                <Avatar
                    size="small"
                    src={getImageLink(manager?.avatar, "avatar_webp", manager?.session)}
                    style={manager.banned ? {filter: "grayscale(100%)"} : {}}
                />
            ),
            tooltip: manager.name,
            ...(typeof onClick === "function" ? {onClick: responsible => onClick(responsible)} : {}),
        }));
        return (
            <ButtonsMenu
                className={className}
                style={style}
                disabled={disabled}
                activeKey={value}
                options={
                    showAllOption
                        ? [
                              ...userOptions,
                              {
                                  key: null,
                                  icon: <TeamOutlined />,
                                  tooltip: t("common.all"),
                                  ...(typeof onClick === "function"
                                      ? {onClick: responsible => onClick(responsible)}
                                      : {}),
                              },
                          ]
                        : userOptions
                }
                {...(typeof onChange === "function" ? {onChange: responsibles => onChange(responsibles)} : {})}
            />
        );
    },
);
