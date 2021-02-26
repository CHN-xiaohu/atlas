import i18next from "i18next";
import {memo, useEffect} from "react";
import {useLocalStorage} from "@rehooks/local-storage";
import {Radio, Tooltip} from "antd";
import {FlagIcon} from "../../pages/common/Flag";
import moment from "moment";
import ru from "moment/locale/ru";
import en_GB from "moment/locale/en-gb";
import zh_CN from "moment/locale/zh-cn";

const language = [
    {
        key: "zh",
        title: (
            <Tooltip title="中文">
                <FlagIcon code="cn" />
            </Tooltip>
        ),
    },
    {
        key: "en",
        title: (
            <Tooltip title="English">
                <FlagIcon code="gb" />
            </Tooltip>
        ),
    },
    {
        key: "ru",
        title: (
            <Tooltip title="Русский">
                <FlagIcon code="ru" />
            </Tooltip>
        ),
    },
];

const momentLocaleMap = {
    en: () => moment.updateLocale("en-gb", en_GB),
    ru: () => moment.updateLocale("ru", ru),
    zh: () => moment.updateLocale("zh-cn", zh_CN),
};

const lng = localStorage.getItem("system-language");
momentLocaleMap[lng ?? "en"]();

const globallyChangeLocale = language => {
    //console.log('change language', language)
    i18next.changeLanguage(language);
    momentLocaleMap[language]();
};

export const LanguageSelector = memo(() => {
    const [selectedLanguage, changeLanguage] = useLocalStorage("system-language", "en");

    useEffect(() => {
        if (selectedLanguage != null) {
            globallyChangeLocale(selectedLanguage);
        } else {
            globallyChangeLocale("en");
        }
    }, [selectedLanguage]);

    return (
        <Radio.Group
            onChange={e => {
                changeLanguage(e.target.value);
            }}
            value={selectedLanguage}
            size="small"
        >
            {language.map(item => (
                <Radio.Button key={item.key} value={item.key}>
                    {item.title}
                </Radio.Button>
            ))}
        </Radio.Group>
    );
});
