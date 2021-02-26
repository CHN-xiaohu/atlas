import {memo, useContext} from "react";
import {useQuery} from "react-query";
import {QuotationContext} from "./Context";
import {useDataMutation} from "hooks/useDataMutation";
import {useQueryClient} from "react-query";
import {SelectQuotationModal} from "./SelectQuotationModal";

export const CopyQuotationItemModal = memo(({...modalParams}) => {
    const queryClient = useQueryClient();
    const {activeQuotationItem, activeQuotation} = useContext(QuotationContext);

    const {data: quotations} = useQuery(
        [
            "newQuotations",
            {
                method: "forLeads",
                leadIds: [activeQuotation?.lead]
            }
        ],
        {
            enable: activeQuotation?.lead && modalParams.visible === true,
            placeholderData: [],
        },
    );

    const {mutate: copyQuotationItem} = useDataMutation("/newQuotationItems/copy", {
        onSuccess: () => {
            queryClient.invalidateQueries("newQuotations");
            queryClient.invalidateQueries("newQuotationItems");
        },
    });

    const handleSelectQuotation = quotation => {
        copyQuotationItem({
            _id: activeQuotationItem._id,
            quotationId: quotation._id,
        });

        modalParams.onCancel();
    };

    return (
        <SelectQuotationModal
            title="复制"
            quotations={quotations}
            onSelectQuotation={handleSelectQuotation}
            {...modalParams}
        />
    );
});
