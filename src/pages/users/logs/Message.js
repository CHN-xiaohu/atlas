import {memo} from "react";
import {Tag, Typography} from "antd";
import {Link} from "react-router-dom";
import moment from "moment";
import {useQuery} from "react-query";
import {useTranslation} from "react-i18next";
import {ContactLog} from "pages/leads/lead/modules/timeline/LogNote";

const {Text} = Typography;

export const LogMessage = memo(({withLink = true, ...log}) => {
    const {data: pipelines} = useQuery(["pipelines"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const {type, event} = log;
    const {t} = useTranslation();
    //const fields = leadFields([], {}, [], t);
    if (type === "lead") {
        if (event.startsWith("contact.")) {
            return (
                <>
                    <Link to={`/leads/${log.lead}`}>{t("users.lead")}</Link> 的联系方式操作
                    <ContactLog {...log} />
                </>
            );
        }

        if (event === "change") {
            if (log.field === "status_id") {
                const from = pipelines.find(pipe => pipe.id === log.oldValue);
                const to = pipelines.find(pipe => pipe.id === log.newValue);
                return (
                    <span>
                        {t("users.moved")} <Link to={`/leads/${log.lead}`}>{t("users.lead")}</Link> {t("users.from")}
                        <Tag color={from?.color}>{from?.name}</Tag> {t("users.to")}
                        <Tag color={to?.color}>{to?.name}</Tag>
                    </span>
                );
            }

            return (
                <span>
                    {t("users.changed")} <Link to={`/leads/${log.lead}`}>{t("users.lead")}</Link> {t("users.property")}
                    <Text strong>?????????????????????????????</Text> {t("users.from")}
                    <Text strong>{log.oldValue ?? "nothing"}</Text> => <Text strong>{log.newValue}</Text>
                </span>
            );
        } else if (event === "delete") {
            return (
                <span>
                    {t("users.deleted")} <Link to={`/leads/${log.lead}`}>{t("users.lead")}</Link>
                </span>
            );
        } else {
            return `${t("users.unknown")} ${log.lead} ${t("users.event")}`;
        }
    } else if (type === "task") {
        if (event === "complete") {
            return (
                <span>
                    {t("users.completed")} <Link to={`/tasks/${log.id}`}>{t("users.task")}</Link>
                    {t("users.withResult")} <Text mark>{log.result}</Text>
                </span>
            );
        } else if (event === "reschedule") {
            return (
                <span>
                    {t("users.reschedule")} <Link to={`/tasks/${log.id}`}>{t("users.task")}</Link> {t("users.to")}
                    {moment(log.time).format("D MMMM YYYY HH:mm")}
                </span>
            );
        } else if (event === "delete") {
            return (
                <span>
                    {t("users.deleted")} <Link to={`/tasks/${log.id}`}>{t("users.task")}</Link>
                </span>
            );
        } else if (event === "add") {
            return (
                <span>
                    {t("users.addedNew")} <Link to={`/tasks/${log.id}`}>{t("users.task")}</Link>
                </span>
            );
        }
    } else if (type === "waMessage") {
        if (event === "send") {
            return (
                <span>
                    {t("users.sendWhatsAppMessage")} {log.body}
                </span>
            );
        } else if (event === "sync") {
            return <span>{t("users.refreshedWhatsAppMessage")}</span>;
        }
    } else if (type === "product") {
        if (event === "add") {
            return (
                <span>
                    {t("users.createdNew")} <Link to={`/products/${log.id}`}>{t("users.product")}</Link>
                </span>
            );
        } else if (event === "change") {
            return (
                <span>
                    {t("users.change")} <Link to={`/products/${log.id}`}>{t("users.product")}</Link>
                    {t("users.property")} <Text strong>{log.key}</Text> <Text strong>{log.oldValue ?? "nothing"}</Text>
                    => <Text strong>{log.newValue ?? "nothing"}</Text>
                </span>
            );
        }
    } else if (type === "quotation") {
        if (event === "add") {
            return (
                <span>
                    {t("users.createdNew")} <Link to={`/quotations/${log.id}`}>{t("users.quotation")}</Link>
                </span>
            );
        }
    }
    return JSON.stringify(log);
});
