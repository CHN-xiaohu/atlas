import {memo} from "react";
import {Checkbox, Popover} from "antd";
import {useGlobalState} from "../../hooks/useGlobalState";
import {capitalize} from "../../Helper";
import {useTranslation} from "react-i18next";
import {produce} from "immer";

const HashInvalidationSettings = memo(() => {
    const [settings, setSettings] = useGlobalState("invalidateSettings");
    return Object.keys(settings).map(type => {
        return (
            <div key={type}>
                <Checkbox
                    onChange={e => {
                        setSettings(settings =>
                            produce(settings, draft => {
                                draft[type] = e.target.checked;
                            }),
                        );
                    }}
                    checked={settings[type]}
                >
                    {capitalize(type)}
                </Checkbox>
            </div>
        );
    });
});

export const HashInvalidationPopover = memo(({children}) => {
    const {t} = useTranslation();
    return (
        <Popover placement="bottom" title={t("markup.realTimeUpdateSettings")} content={<HashInvalidationSettings />}>
            {children}
        </Popover>
    );
});
