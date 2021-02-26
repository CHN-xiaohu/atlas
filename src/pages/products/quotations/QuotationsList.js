import {useRequest} from "../../../hooks/useRequest";
import {Empty, Popconfirm, Space, Collapse, Tooltip, message} from "antd";
import {DeleteOutlined, DownloadOutlined, IdcardOutlined, SelectOutlined, ShareAltOutlined} from "@ant-design/icons";
import {download, isProduction, office, usd} from "../../../Helper";
import {QuotationList} from "./QuotationList";
import {memo, useState} from "react";
import {InlineButton} from "../../common/InlineButton";
import {useHistory} from "react-router-dom";
import {Spinner} from "../../common/Spinner";
import moment from "moment";
import {useTranslation} from "react-i18next";
import {useQueryClient} from "react-query";
import {useDataMutation} from "../../../hooks/useDataMutation";
import {LimitedView} from "../../common/LimitedView";
import {useSocketStorage} from "../../../hooks/useSocketStorage";

const {Panel} = Collapse;

export const QuotationsList = memo(({data, onSelect, loading}) => {
    const queryClient = useQueryClient();
    const history = useHistory();
    const {data: removeQuotation} = useDataMutation("/quotations/delete", {
        onSuccess: () => {
            queryClient.invalidateQueries("quotations");
        },
    });

    const [activeQuotation, setActiveQuotation] = useState();
    const [downloading, setDownloading] = useState();
    const rates = useSocketStorage("forex");
    const forex = usd(rates);
    const downloadExcel = useRequest("/quotations/toExcel");
    const {t} = useTranslation();
    if (loading && data.length === 0) {
        return <Spinner />;
    } else if (data.length === 0) {
        return <Empty description="No quotations" />;
    }
    return (
        <Collapse accordion loading={loading} onChange={id => setActiveQuotation(id)} activeKey={activeQuotation}>
            {data.map(quotation => {
                const {name, _id, items, language, lead} = quotation;
                return (
                    <Panel
                        key={_id}
                        header={
                            <Space>
                                <span>[{(language ?? "en")?.toUpperCase()}]</span>
                                <span>{name}</span>
                                <span>[{items.length}]</span>
                                <span>[{moment(quotation.created_at).format("D MMMM YYYY HH:mm")}]</span>
                            </Space>
                        }
                        extra={[
                            <LimitedView groups={[office]}>
                                <Tooltip title={t("products.lead")}>
                                    <InlineButton
                                        icon={<IdcardOutlined />}
                                        onClick={() => history.push(`/leads/${lead}/quotations`)}
                                    />
                                </Tooltip>
                            </LimitedView>,
                            <LimitedView groups={[(g, user) => user?.access?.products?.canAddQuotations]}>
                                <Tooltip title={t("products.select")}>
                                    <InlineButton
                                        icon={<SelectOutlined />}
                                        onClick={() => typeof onSelect === "function" && onSelect(_id)}
                                    />
                                </Tooltip>
                            </LimitedView>,
                            <LimitedView groups={[(g, user) => user?.access?.products?.canExportQuotations]}>
                                <Tooltip title={t("products.download")}>
                                    <InlineButton
                                        loading={downloading === _id}
                                        disabled={downloading === _id}
                                        onClick={async () => {
                                            setDownloading(_id);
                                            const file = await downloadExcel({
                                                _id,
                                                header: true,
                                                forex,
                                            });
                                            download(file.link, file.name);
                                            setDownloading();
                                        }}
                                        icon={<DownloadOutlined />}
                                    />
                                </Tooltip>
                            </LimitedView>,
                            <LimitedView groups={[(g, user) => user?.access?.products?.canExportQuotations]}>
                                <Tooltip title={t("products.share")}>
                                    <InlineButton
                                        type="text"
                                        icon={<ShareAltOutlined />}
                                        onClick={async () => {
                                            const address = isProduction()
                                                ? quotation.language === "en"
                                                    ? "globus-china.com"
                                                    : "globus.world"
                                                : "localhost";
                                            await navigator.clipboard.writeText(
                                                `https://${address}/horizon?session=${quotation.lead}&id=${quotation._id}`,
                                            );
                                            message.success(t("products.successfullyCopiedLink"));
                                        }}
                                    />
                                </Tooltip>
                            </LimitedView>,
                            <LimitedView groups={[(group, user) => user?.access?.products?.canDeleteQuotations]}>
                                <Popconfirm
                                    okText={t("products.ok")}
                                    cancelText={t("products.cancel")}
                                    title={`${t("products.areYouSureYouWantToDeleteThisQuotation")}?`}
                                    onConfirm={() => {
                                        removeQuotation({_id});
                                    }}
                                >
                                    <Tooltip title={t("products.delete")}>
                                        <InlineButton type="text" danger icon={<DeleteOutlined />} />
                                    </Tooltip>
                                </Popconfirm>
                            </LimitedView>,
                        ]}
                    >
                        <QuotationList {...quotation} />
                    </Panel>
                );
            })}
        </Collapse>
    );
});
