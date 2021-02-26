import {memo, useState} from "react";
import {useQuery} from "react-query";
import {Row, Col} from "antd";
import {Header} from "pages/quotations/Header";
import {Title} from "./Title";
import {Spinner} from "pages/common/Spinner";
import {LeadQuotations} from "pages/quotations/LeadQuotations";
import {useImmer} from "hooks/useImmer";
import {color} from "Helper";
import {usd} from "Helper";
import {useTranslation} from "react-i18next";
import {useSocketStorage} from "../../../../../../hooks/useSocketStorage";

export const Entry = memo(({lead, onSelectQuotation}) => {
    const {t} = useTranslation();
    const [sort, setSort] = useState("lastUpdate");
    const [asc, toggleAsc] = useState(false);
    const [sortForPreliminary, setSortForPreliminary] = useState("lastUpdate");
    const [ascForPreliminary, toggleAscForPreliminary] = useState(false);

    const [filters, setFilters] = useImmer({
        time: null,
        responsible: null,
        search: "",
    });

    const {data: quotations, isLoading: quotationsAreLoading} = useQuery(
        [
            "newQuotations",
            {
                method: "forLeadForFilters",
                filters: {
                    ...filters,
                    preliminary: false,
                },
                leadId: lead?._id,
            },
        ],
        {
            enabled: lead?._id != null,
        },
    );

    const {data: quotationsForPreliminary, isLoading: quotationsForPreliminaryAreLoading} = useQuery(
        [
            "newQuotations",
            {
                method: "forLeadForFilters",
                filters: {
                    ...filters,
                    preliminary: true,
                },
                leadId: lead?._id,
            },
        ],
        {
            enabled: lead?._id != null,
        },
    );

    const allQuotationIds = [].concat(
        quotations == null ? [] : quotations.map(quotation => quotation._id),
        quotationsForPreliminary == null ? [] : quotationsForPreliminary.map(quotation => quotation._id),
    );

    const {data: quotationUnreadCount} = useQuery(
        [
            "comments",
            {
                method: "unreadForQuotations",
                quotationIds: allQuotationIds,
            },
        ],
        {
            enabled: allQuotationIds?.length > 0,
            placeholderData: [],
        },
    );

    const {data: users} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });

    const rates = useSocketStorage("forex");
    const forex = usd(rates);

    const commonParamsLeadQuotations = {
        lead: lead,
        users: users,
        quotationUnreadCount: quotationUnreadCount,
        forex: forex,
        onSelectQuotation: onSelectQuotation,
        showFlag: true,
    };

    return (
        <Row gutter={[24, 24]}>
            <Col span={24}>
                <Header
                    filters={filters}
                    updateFilter={(filter, value) => {
                        setFilters(draft => {
                            draft[filter] = value;
                        });
                    }}
                    lead={lead}
                    filterPresence={false}
                />
            </Col>

            <Col span={24}>
                <Title
                    color={color("green", 6)}
                    title={t("quotation.orderSelection")}
                    quotationCount={quotations?.length ?? 0}
                    sort={sort}
                    setSort={setSort}
                    asc={asc}
                    toggleAsc={toggleAsc}
                />

                {quotationsAreLoading ? (
                    <Spinner />
                ) : (
                    <LeadQuotations quotations={quotations} sort={sort} asc={asc} {...commonParamsLeadQuotations} />
                )}
            </Col>

            <Col span={24}>
                <Title
                    color={color("orange", 3)}
                    title={t("quotation.preliminary")}
                    quotationCount={quotationsForPreliminary?.length ?? 0}
                    sort={sortForPreliminary}
                    setSort={setSortForPreliminary}
                    asc={ascForPreliminary}
                    toggleAsc={toggleAscForPreliminary}
                />

                {quotationsForPreliminaryAreLoading ? (
                    <Spinner />
                ) : (
                    <LeadQuotations
                        quotations={quotationsForPreliminary}
                        sort={sortForPreliminary}
                        asc={ascForPreliminary}
                        {...commonParamsLeadQuotations}
                    />
                )}
            </Col>
        </Row>
    );
});
