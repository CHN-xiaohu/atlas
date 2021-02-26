import {groupBy} from "../../../../Helper";
import {PurchasesTable} from "../../purchases/report/PurchasesTable";
import {memo} from "react";
import styled from "styled-components";
import {useQuery} from "react-query";

const StyledContainer = styled.div`
    margin-top: 1rem;
    .ant-table-body {
        overflow-x: auto;
    }
    .ant-table-footer {
        background: inherit !important;
    }
`;

export const Purchases = memo(({lead}) => {
    const {data: client} = useQuery(
        [
            "leads",
            {
                method: "byId",
                _id: lead._id,
            },
        ],
        {
            enabled: lead._id != null,
        },
    );
    const {data: purchases} = useQuery(
        [
            "purchases",
            {
                method: "forLeads",
                leads: [lead._id],
            },
        ],
        {
            enabled: lead._id != null,
            placeholderData: [],
        },
    );

    const data = {
        ...client,
        purchases: Object.values(groupBy(purchases ?? [], "receipt", true)).flat(),
    };
    return (
        <StyledContainer>
            <PurchasesTable client={data} />
        </StyledContainer>
    );
});
