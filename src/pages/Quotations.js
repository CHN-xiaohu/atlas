import {memo} from "react";
import {Row, Col, Divider} from "antd";
import {Header} from "./quotations/Header";
import {LeadCards} from "./quotations/LeadCards";
import {Spinner} from "pages/common/Spinner";
import {useImmer} from "hooks/useImmer";
import {useQuery} from "react-query";
import {color} from "Helper";
import {useTranslation} from "react-i18next";

export const Quotations = memo(() => {
    const {t} = useTranslation();
    const [filters, setFilters] = useImmer({
        time: null,
        responsible: null,
        presence: null,
        search: "",
    });

    const finalFilterForPreliminary = {
        ...filters,
        preliminary: true,
    };

    const finalFilter = {
        ...filters,
        preliminary: false,
    };

    const {data: leadsForPreliminary, isLoading: leadsForPreliminaryIsLoading} = useQuery(
        [
            "newQuotations",
            {
                method: "leadsForFilters",
                filters: finalFilterForPreliminary,
            },
        ],
        {
            enabled: true,
        },
    );

    const {data: leads, isLoading: leadsIsLoading} = useQuery(
        [
            "newQuotations",
            {
                method: "leadsForFilters",
                filters: finalFilter,
            },
        ],
        {
            enabled: true,
        },
    );

    return (
        <>
            <Header
                filters={filters}
                updateFilter={(filter, value) => {
                    setFilters(draft => {
                        draft[filter] = value;
                    });
                }}
            />
            <Divider />
            <Row gutter={48}>
                <Col span={12}>
                    {leadsForPreliminaryIsLoading ? (
                        <Spinner />
                    ) : (
                        <LeadCards
                            titleColor={color("orange", 3)}
                            title={t("quotation.preliminary")}
                            leads={leadsForPreliminary}
                            filters={finalFilterForPreliminary}
                        />
                    )}
                </Col>
                <Col span={12}>
                    {leadsIsLoading ? (
                        <Spinner />
                    ) : (
                        <LeadCards
                            titleColor={color("green", 6)}
                            title={t("quotation.orderSelection")}
                            leads={leads}
                            filters={finalFilter}
                        />
                    )}
                </Col>
            </Row>
        </>
    );
});
