import {memo} from "react";
import {useTranslation} from "react-i18next";
import {Button, Result} from "antd";

export const NotFound = memo(({history}) => {
    const {t} = useTranslation();
    return (
        <Result
            status="404"
            title={404}
            subTitle={t("markup.thePageYouVisitedDoesNotExist")}
            extra={
                <Button type="primary" onClick={() => history.goBack()}>
                    {t("markup.goBack")}
                </Button>
            }
        />
    );
});
