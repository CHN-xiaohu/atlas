import { memo, useState } from "react";
import {Tooltip} from "antd";
import {useTranslation} from "react-i18next";
import {DownloadOutlined} from "@ant-design/icons";
import {InlineButton} from "pages/common/InlineButton";
import {useRequest} from "hooks/useRequest";
import {download} from "Helper";
import {LimitedView} from "pages/common/LimitedView";

export const DownloadExcel = memo(({quotation, forex}) => {
    const {t} = useTranslation();
    const [isDownloading, setIsDownloading] = useState();
    const downloadExcel = useRequest("/newQuotations/toExcel");

    return (
        <LimitedView groups={[(g, user) => user?.access?.products?.canExportQuotations]}>
            <Tooltip title={t("products.download")}>
                <InlineButton
                    loading={isDownloading}
                    disabled={isDownloading}
                    onClick={async () => {
                        setIsDownloading(true);
                        const file = await downloadExcel({
                            _id: quotation._id,
                            forex,
                        });
                        download(file.link, file.name);
                        setIsDownloading(false);
                    }}
                    icon={<DownloadOutlined />}
                />
            </Tooltip>
        </LimitedView>
    );
});
