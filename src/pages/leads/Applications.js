import {memo} from "react";
import {useTranslation} from "react-i18next";

export const Applications = memo(({settings}) => {
    const {t} = useTranslation();
    console.log(settings);
    return <div>{t("leads.underDevelopment")}</div>;
});
