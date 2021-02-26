import {memo} from "react";
import {Popconfirm, Tooltip} from "antd";
import {useTranslation} from "react-i18next";
import {DeleteOutlined} from "@ant-design/icons";
import {InlineButton} from "pages/common/InlineButton";
import {LimitedView} from "pages/common/LimitedView";
import {useDataMutation} from "hooks/useDataMutation";
import {useLocalStorage} from "@rehooks/local-storage";
import {useQueryClient} from "react-query";

export const Delete = memo(({quotation}) => {
    const queryClient = useQueryClient();
    const {t} = useTranslation();
    const [, setActiveQuotationId] = useLocalStorage("shopping-cart-quotation");

    const {mutate: deleteQuotations} = useDataMutation("/newQuotations/delete", {
        onSuccess: () => {
            setActiveQuotationId(undefined);
            queryClient.invalidateQueries("newQuotations");
        },
    });

    return (
        <LimitedView groups={[(group, user) => user?.access?.products?.canDeleteQuotations]}>
            <Popconfirm
                okText={t("leads.ok")}
                cancelText={t("leads.cancel")}
                title={`${t("products.areYouSureYouWantToDeleteThisQuotation")}?`}
                onConfirm={() => {
                    deleteQuotations({ids: [quotation._id]});
                }}
            >
                <Tooltip title={t("leads.delete")}>
                    <InlineButton type="text" danger icon={<DeleteOutlined />} />
                </Tooltip>
            </Popconfirm>
        </LimitedView>
    );
});
