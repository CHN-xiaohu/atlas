import {memo} from "react";
import {useDataMutation} from "hooks/useDataMutation";
import {useQueryClient} from "react-query";
import {QuotationModal} from "../global/QuotationModal";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "hooks/useGlobalState";

export const EditQuotationModal = memo(({quotation, onClose, ...modalParams}) => {
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const [user] = useGlobalState("user");
    const canEditResponsibles = user?.access?.products?.canEditAllQuotations || quotation?.author === user.login;

    const {mutate: updateQuotation} = useDataMutation("/newQuotations/updateWhole", {
        onSuccess: () => {
            queryClient.invalidateQueries("newQuotations");
        },
    });

    const onConfirm = formData => {
        const {itemCount, ...preparedData} = formData;
        updateQuotation({
            data: preparedData,
        });
        onClose();
    };

    return (
        <QuotationModal
            title={t("leads.editQuotation")}
            author={quotation?.author}
            canEditResponsibles={canEditResponsibles}
            formData={quotation}
            onConfirm={onConfirm}
            onClose={onClose}
            okText={t("leads.modify")}
            cancelText={t("leads.cancel")}
            {...modalParams}
        />
    );
});
