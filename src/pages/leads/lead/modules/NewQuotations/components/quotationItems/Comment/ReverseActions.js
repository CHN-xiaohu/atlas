import {memo} from "react";
import moment from "moment";
import {Popconfirm, Tooltip, Space} from "antd";
import {DeleteTwoTone, ClockCircleTwoTone, CheckCircleTwoTone} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import {useDataMutation} from "hooks/useDataMutation";
import {useQueryClient} from "react-query";
import {LimitedView} from "pages/common/LimitedView";

const isEmptyName = (name) => name == null || name.trim() === "";

export const ReverseActions = memo(({reverse, client, comment, lead}) => {
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const {mutate: deleteComment} = useDataMutation("/comments/delete", {
        onSuccess: () => {
            queryClient.invalidateQueries("comments");
        },
    });
    const readContacts = lead.contacts.filter(contact => comment.readBy.includes(contact._id))
    const readTooltipTitle = readContacts.length > 0
    ? readContacts
        .map(contact => (isEmptyName(contact.contact_name) ? contact._id : contact.contact_name) + " 已读")
        .join("\n")
    : "客户未读";



    const actions = [
        <span>
            {moment(comment.time).format(
                moment(comment.time).isSame(moment(), "day") ? "HH:mm:ss" : "D MMMM HH:mm:ss",
            )}
        </span>,
        <LimitedView groups={[(g, user) => user?.access?.products?.canDeleteClientMessages]}>
            <Popconfirm
                title={`${t("quotation.areYouSure")}？`}
                okText={t("quotation.yes")}
                cancelText={t("quotation.no")}
                onConfirm={() => {
                    if (comment.type === "text") {
                        deleteComment({_id: comment._id});
                    } else {
                        deleteComment({_id: comment._id});
                    }
                }}
            >
                <DeleteTwoTone twoToneColor="#ff4d4f" />
            </Popconfirm>
        </LimitedView>,
        !client ? (
            <Tooltip title={readTooltipTitle}>
            {
                readContacts.length > 0
                ? <CheckCircleTwoTone />
                : <ClockCircleTwoTone />
            }
            </Tooltip>
        ) : null
    ];

    return (
        <Space>
        {
            reverse
            ? actions.concat([]).reverse()
            : actions
        }
        </Space>
    );
});
