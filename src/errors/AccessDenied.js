import {memo} from "react";
import {useTranslation} from "react-i18next";
import {Button, Result} from "antd";

export const AccessDenied = memo(({history}) => {
    const {t} = useTranslation();
    return (
        <Result
            status="403"
            title={403}
            subTitle={t("markup.youDontHaveAccessToThisPage")}
            extra={
                <Button type="primary" onClick={() => history.goBack()}>
                    {t("markup.goBack")}
                </Button>
            }
        />
    );
});
