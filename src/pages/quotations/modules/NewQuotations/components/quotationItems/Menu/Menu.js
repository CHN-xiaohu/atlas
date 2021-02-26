import {memo} from "react";
import {Wrapper} from "./style";
import {Cards} from "./Cards";
import {useQuery} from "react-query";
import {useGlobalState} from "hooks/useGlobalState";
import {useScrollToViewport} from "hooks/useScrollToViewport";

export const Menu = memo(({lead, quotation, quotationItems, onSwitchQuotationItem, onSelectQuotation}) => {
    const [user] = useGlobalState("user");
    const canSeeComment = user?.access?.products?.canSeeComments;

    const {data: quotationItemUnreads} = useQuery(
        [
            "comments",
            {
                method: "unread",
                quotationId: quotation?._id,
                leadId: quotation?.lead
            },
        ],
        {
            enabled: quotation?.lead != null && quotation?._id != null && canSeeComment,
            placeholderData: [],
        },
    );

    const {parentRef, scrollToViewportByRef} = useScrollToViewport();

    return quotationItems == null ? null : (
        <Wrapper ref={parentRef}>
            <Cards
                lead={lead}
                quotation={quotation}
                onSwitchQuotationItem={onSwitchQuotationItem}
                quotationItems={quotationItems}
                quotationItemUnreads={quotationItemUnreads}
                onSelectQuotation={onSelectQuotation}
                scrollToViewportByRef={scrollToViewportByRef}
            />
        </Wrapper>
    );
});
