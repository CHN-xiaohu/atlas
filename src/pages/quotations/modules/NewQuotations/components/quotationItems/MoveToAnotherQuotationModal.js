import {memo, useContext} from "react";
import {useQuery} from "react-query";
import {QuotationContext} from "./Context";
import {useDataMutation} from "hooks/useDataMutation";
import {useQueryClient} from "react-query";
import {useTranslation} from "react-i18next";
import {SelectQuotationModal} from "./SelectQuotationModal";

export const MoveToAnotherQuotationModal = memo(({...modalParams}) => {
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const {activeQuotationItem, activeQuotation} = useContext(QuotationContext);

    const {data: quotations} = useQuery(
        [
            "newQuotations",
            {
                method: "forLeads",
                leadIds: [activeQuotation?.lead],
            },
        ],
        {
            enable: activeQuotation?.lead && modalParams.visible === true,
            placeholderData: [],
        },
    );

    const filteredQuotations = quotations.filter(quotation => quotation._id !== activeQuotation._id);

    const {mutate: moveToAnotherQuotation} = useDataMutation("/newQuotationItems/moveToAnotherQuotation", {
        onSuccess: () => {
            queryClient.invalidateQueries("newQuotations");
            queryClient.invalidateQueries("newQuotationItems");
        },
    });

    const handleSelectQuotation = quotation => {
        moveToAnotherQuotation({
            _id: activeQuotationItem._id,
            quotationId: quotation._id,
        });

        modalParams.onCancel();
    };

    return (
        <SelectQuotationModal
            title={t("leads.move")}
            quotations={filteredQuotations}
            onSelectQuotation={handleSelectQuotation}
            {...modalParams}
        />
    );
});
