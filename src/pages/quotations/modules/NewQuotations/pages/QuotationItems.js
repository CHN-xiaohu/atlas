import {useGlobalState} from "hooks/useGlobalState";
import {memo} from "react";
import {useQuery} from "react-query";
import {Entry} from "../components/quotationItems/Entry";

export const QuotationItems = memo(({lead, routeProps}) => {
    const {history, match} = routeProps;
    const activeQuotationId = match.params.quotationId;
    const activeCardId = match.params.quotationItemId;
    const [readStatus] = useGlobalState("readStatus");
    const [approveStatus] = useGlobalState("approveStatus");

    const {data: activeQuotation, isLoading: isActiveQuotationLoading} = useQuery(
        [
            "newQuotations",
            {
                method: "byId",
                _id: activeQuotationId,
            },
        ],
        {
            enabled: activeQuotationId != null,
        },
    );

    const {data: quotationItems, isLoading: isQuotationItemsLoading} = useQuery(
        [
            "newQuotationItems",
            {
                method: "forQuotations",
                quotationIds: [activeQuotation?._id],
                leadId: lead?._id,
                readStatus,
                approveStatus,
            },
        ],
        {
            enabled: activeQuotation?._id != null
        },
    );

    if (isActiveQuotationLoading || isQuotationItemsLoading) return null;
    if (activeQuotation === null) {
        history.replace(`/leads/${lead._id}/new_quotations`);
    }

    const activeQuotationItem = quotationItems == null ? null : quotationItems.find(item => item._id === activeCardId);
    if (lead._id !== activeCardId) {
        if (activeQuotation != null && quotationItems != null) {
            if (quotationItems.length > 0) {
                if (activeQuotationItem == null) {
                    history.replace(`/leads/${lead._id}/new_quotations/${activeQuotationId}/${quotationItems[0]._id}`);
                    return null;
                }
            } else {
                if (activeCardId != null) {
                    history.replace(`/leads/${lead._id}/new_quotations/${activeQuotationId}`);
                    return null;
                }
            }
        }
    }

    const onSwitchQuotationItem = quotationItemId => {
        history.replace(`/leads/${lead._id}/new_quotations/${activeQuotation._id}/${quotationItemId}`);
    };

    const onSelectQuotation = () => {
        history.push("/products");
    };

    const onBack = () => {
        history.goBack();
    };

    return (
        <Entry
            lead={lead}
            activeQuotation={activeQuotation}
            activeQuotationItem={activeQuotationItem}
            activeCardId={activeCardId}
            quotationItems={quotationItems}
            onSwitchQuotationItem={onSwitchQuotationItem}
            onSelectQuotation={onSelectQuotation}
            onBack={onBack}
        />
    );
});
