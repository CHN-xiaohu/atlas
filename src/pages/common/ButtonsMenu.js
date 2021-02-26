import {memo} from "react";
import {useHistory} from "react-router-dom";
import {Button, Tooltip} from "antd";
import {toImplement} from "../../Helper";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "../../hooks/useGlobalState";
import {color} from "Helper";

export const ButtonsMenu = memo(
    ({options = [], activeKey, replace = true, onChange, shape, disabled = false, ...params}) => {
        const history = useHistory();
        const [user] = useGlobalState("user");
        const {t} = useTranslation();
        return (
            <Button.Group {...params}>
                {options.map(option => {
                    const {key, label, path, icon, onClick, tooltip, ...params} = option;
                    const finalParams = Object.keys(params).reduce((final, param) => {
                        if (typeof params[param] === "function") {
                            final[param] = params[param](user.group, user);
                        } else {
                            final[param] = params[param];
                        }
                        return final;
                    }, {});
                    if (finalParams.hidden) {
                        return null;
                    }

                    const isActive = Array.isArray(activeKey) ? activeKey.includes(key) : activeKey === key;

                    const style = {
                        backgroundColor: isActive ? color("blue", 5) : undefined,
                        color: isActive ? "#fff" : undefined,
                    };

                    const button = (
                        <Button
                            key={key}
                            icon={icon}
                            disabled={disabled}
                            style={{...style, borderColor: "#d9d9d9"}}
                            onClick={() => {
                                if (typeof onChange === "function") {
                                    if (Array.isArray(activeKey)) {
                                        if (activeKey.includes(key)) {
                                            onChange(activeKey.filter(k => k !== key));
                                        } else {
                                            onChange([...activeKey, key]);
                                        }
                                    } else {
                                        onChange(key);
                                    }
                                } else if (typeof onClick === "function") {
                                    onClick(key, history, user);
                                } else if (typeof path === "function") {
                                    history[replace ? "replace" : "push"](path(activeKey === key, key));
                                } else if (typeof path === "string" && path.length > 0) {
                                    history[replace ? "replace" : "push"](path);
                                } else {
                                    toImplement();
                                }
                            }}
                            {...finalParams}
                        >
                            {t(label)}
                        </Button>
                    );
                    return t(tooltip) == null ? (
                        button
                    ) : (
                        <Tooltip key={`${t(tooltip)}-${key}`} title={t(tooltip)}>
                            {button}
                        </Tooltip>
                    );
                })}
            </Button.Group>
        );
    },
);
