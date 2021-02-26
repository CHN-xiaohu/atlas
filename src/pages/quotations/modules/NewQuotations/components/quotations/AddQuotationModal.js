import {memo} from "react";
import {categories} from "data/productFields";
import {useDataMutation} from "hooks/useDataMutation";
import {useQueryClient} from "react-query";
import {QuotationModal} from "../global/QuotationModal";
import {useGlobalState} from "hooks/useGlobalState";
import {useTranslation} from "react-i18next";

export const AddQuotationModal = memo(({
    lead = null,
    onClose,
    ...modalParams
}) => {
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const [user] = useGlobalState("user");
    const formData = {
        lead: lead?._id,
        name: "",
        language: lead?.russianSpeaking ? "ru" : "en",
        responsibles: [user.login],
        preliminary: false,
        ...categories.reduce((obj, category) => {
            obj[category.key] = category.defaultInterest ?? 0.3;
            return obj;
        }, {}),
    };

    const {mutate: addQuotation} = useDataMutation("/newQuotations/add", {
        onSuccess: () => {
            queryClient.invalidateQueries("newQuotations");
        },
    });

    const onConfirm = formData => {
        addQuotation(formData);
        onClose();
    };

    return (
        <QuotationModal
            title={t("leads.addNewQuotation")}
            author={user.login}
            canEditResponsibles={true}
            formData={formData}
            onConfirm={onConfirm}
            onClose={onClose}
            leadSelectable={lead == null}
            {...modalParams}
        />
    );
});
