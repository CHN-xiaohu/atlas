import {memo} from "react";
import {useQuery} from "react-query";
import {LeadQuotations as LeadQuotationsPureUI} from "../LeadQuotations";

/**
 * ignorable params of the pure ui:
 * quotations,
 * users
 */
export const LeadQuotations = memo(({
    active = true,
    lead,
    filters,
    onSelectQuotation,
    ...params
}) => {
    const leadId = lead._id;
    const {data: quotations} = useQuery(
        [
            "newQuotations",
            {
                method: "forLeadForFilters",
                filters,
                leadId,
            },
        ],
        {
            enabled: active,
        },
    );

    const {data: users} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });

    return (
        <LeadQuotationsPureUI
            lead={lead}
            quotations={quotations}
            users={users}
            onSelectQuotation={onSelectQuotation}
            {...params}
        />
    )
});
