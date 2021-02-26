import {useState} from "react";
import {QuotationList} from "./QuotationList";
import {useQuery} from "react-query";
import {Pagination} from "antd";
import {Spinner} from "pages/common/Spinner";
import {useHistory} from "react-router-dom";
import {useLocalStorage} from "@rehooks/local-storage";
import {Flex} from "styled/flex";

export const AllQuotationEntry = ({onSelectQuotation}) => {
    const history = useHistory();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [, setActiveQuotationId] = useLocalStorage("shopping-cart-quotation");

    const {data: quotations, isPlaceholderData} = useQuery(
        [
            "newQuotations",
            {
                method: "all",
                skip: pageSize * page - pageSize,
                limit: pageSize,
            },
        ],
        {
            enabled: true,
            placeholderData: [],
        },
    );

    const {data: total} = useQuery(
        [
            "newQuotations",
            {
                method: "count",
            },
        ],
        {
            enabled: true,
            placeholderData: 0,
        },
    );

    const onClickLink = quotation => {
        setActiveQuotationId(quotation._id);
        onSelectQuotation();
    };

    const onClickDetail = quotation => {
        history.push(`/leads/${quotation.lead}/new_quotations/${quotation._id}`);
    };

    if (isPlaceholderData) return <Spinner />;

    return (
        <Flex style={{height: "100%", overflow: "hidden"}} column>
            <div style={{flex: "1", overflow: "auto"}}>
                <QuotationList
                    quotations={quotations}
                    showDetailControl={true}
                    onClickLink={onClickLink}
                    onClickDetail={onClickDetail}
                    onSelectQuotation={onSelectQuotation}
                />
            </div>
            <Pagination
                style={{flexShrink: "0", marginTop: "10px"}}
                showQuickJumper
                current={page}
                pageSize={pageSize}
                hideOnSinglePage={true}
                total={total}
                responsive
                onChange={page => {
                    setPage(page);
                }}
                onShowSizeChange={(current, size) => {
                    setPageSize(size);
                }}
            />
        </Flex>
    );
};
