import {memo} from "react";
import {Popconfirm, Tooltip} from "antd";
import {ToolOutlined} from "@ant-design/icons";
import {useQueryClient} from "react-query";
import {useDataMutation} from "hooks/useDataMutation";
import {InlineButton} from "pages/common/InlineButton";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "hooks/useGlobalState";

export const useCanResetPosition = () => {
    const [user] = useGlobalState("user");
    return user?.access?.products?.canEditQuotations;
};

export const ResetPosition = memo(({quotation}) => {
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const {mutate: resetPosition} = useDataMutation("/newQuotations/resetPosition", {
        onSuccess: () => {
            queryClient.invalidateQueries("newQuotations");
            queryClient.invalidateQueries("newQuotationItems");
        },
    });

    return (
        <Popconfirm
            okText={t("leads.ok")}
            cancelText={t("leads.cancel")}
            title={t("quotation.theSortWillBeResetPleaseConfirm")}
            onConfirm={() => {
                console.log("quotation!!!", quotation);
                resetPosition({
                    _id: quotation._id,
                });
            }}
        >
            <Tooltip title={t("quotation.fixSortingProblems")}>
                <InlineButton type="text" icon={<ToolOutlined />} />
            </Tooltip>
        </Popconfirm>
    );
});
