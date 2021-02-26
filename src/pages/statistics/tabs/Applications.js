import {Button, Col, Space, DatePicker, List} from "antd";
import { memo } from "react";
import {StatusSelector} from "../common/StatusSelector";
import {extendMoment} from "moment-range";
import Moment from "moment";
import {Column} from "@ant-design/charts";
import {useImmer} from "../../../hooks/useImmer";
import {CountrySelector} from "../../common/CountrySelector";
import {FlagMaker} from "../../common/EditableFields";
import {getCountryCode} from "../../../data/countries";
import {useQuery} from "react-query";
import {useTranslation} from "react-i18next";

const {RangePicker} = DatePicker;

const moment = extendMoment(Moment);

const group = source => {
    if (source.includes("jivosite") || source.includes("jivochat")) {
        return "Jivochat";
    } else if (source.includes("mail")) {
        return "Email";
    } else if (source.includes("phone")) {
        return "Phone";
    } else if (source.includes("recommendation")) {
        return "Recommendation";
    } else if (source.includes("globus-china.com")) {
        return "globus-china.com";
    } else if (source.includes("globus.world")) {
        return "globus.world";
    } else if (source.includes("globus-furniture.com")) {
        return "globus-furniture.com";
    } else if (source.includes("globus-furniture.ru")) {
        return "globus-furniture.ru";
    } else if (source.includes("mlchina")) {
        return "mlchina.ru";
    } else if (source.includes("whatsapp")) {
        return "Whatsapp";
    } else if (source.includes("instagram") || source.includes("IG")) {
        return "Instagram";
    } else if (source.includes("call")) {
        return "Phone call";
    } else if (source.includes("facebook")) {
        return "Facebook";
    } else if (source.includes("viber")) {
        return "Viber";
    } else if (source.includes("taplink")) {
        return "Taplink";
    } else if (source.includes("manual")) {
        return "Manually added";
    } else if (source.includes("youtube")) {
        return "Youtube";
    } else {
        return "Others";
    }
};

const sourcesProps = t => {
    return {
        title: {
            visible: true,
            text: t("statistics.sources"),
        },
        description: {
            visible: true,
            text: t("statistics.distributionOfSources"),
        },
        statistic: {
            totalLabel: "Total",
        },
        forceFit: true,
        padding: "auto",
        xField: "source",
        yField: "count",
        colorField: "source",
    };
};

const SourcesAnalytics = memo(({clients}) => {
    const {t} = useTranslation();
    const grouped = clients.reduce((acc, client) => {
        const source = client.source || "";
        const g = group(source.toLowerCase());
        if (g === "Others") {
            console.log("unknown source", source, client);
        }
        if (Array.isArray(acc[g])) {
            acc[g].push(client);
        } else {
            acc[g] = [client];
        }
        return acc;
    }, {});
    const data = Object.keys(grouped).map(source => ({
        source,
        count: grouped[source].length,
    }));

    return <Column {...sourcesProps(t)} data={data} />;
});

const applicationProps = t => {
    return {
        title: {
            visible: true,
            text: t("statistics.applicationsByMonth"),
        },
        forceFit: true,
        padding: "auto",
        xField: "month",

        yField: "applications",
        meta: {
            month: {
                alias: "Month",
            },
            applications: {
                alias: "Applications",
            },
        },
    };
};

const ApplicationsAnalytics = memo(({clients, interval}) => {
    const {t} = useTranslation();
    const months = Array.from(interval.by("month"));
    const data = months.map(month => {
        return {
            month: month.format("MMM YYYY"),
            applications: clients.filter(client => moment(client.created_at).isSame(month, "month")).length,
        };
    });
    return <Column {...applicationProps(t)} data={data} />;
});

const TopCountries = memo(({stats, clients}) => {
    const {t} = useTranslation();
    return (
        <List
            header={t("statistics.topCountriesByApplications")}
            dataSource={Object.keys(stats).sort((a, b) => stats[b] - stats[a])}
            renderItem={country => {
                return (
                    <List.Item key={country} actions={[stats[country]]}>
                        <List.Item.Meta
                            title={
                                <Space>
                                    <FlagMaker country={getCountryCode(country)} />
                                    {country}
                                </Space>
                            }
                        />
                    </List.Item>
                );
            }}
        />
    );
});

export const Applications = memo(() => {
    const [params, patchParams] = useImmer({
        from: moment().add(-1, "year"),
        to: moment(),
        statuses: [
            20674270,
            22283386,
            23674879,
            22596196,
            31314169,
            28521454,
            23674579,
            20674273,
            20674288,
            22115713,
            142,
        ],
    });
    const interval = moment.range(params.from, params.to);
    const {data: clients} = useQuery(
        [
            "leads",
            {
                method: "applications",
                ...params,
            },
        ],
        {
            placeholderData: [],
        },
    );
    const statsByCountry = clients.reduce((stats, client) => {
        const country = client.country ?? "noCountry";
        if (stats[country] == null) {
            stats[country] = 0;
        }
        stats[country]++;
        return stats;
    }, {});
    const {t} = useTranslation();
    return (
        <>
            <Col span={24}>
                <Space>
                    <Button
                        onClick={() =>
                            patchParams(draft => {
                                draft.from = moment().add(-1, "year").startOf("day");
                                draft.to = moment().endOf("day");
                            })
                        }
                    >
                        {t("statistics.lastYear")}
                    </Button>
                    <Button
                        onClick={() =>
                            patchParams(draft => {
                                draft.from = moment().add(-6, "month").startOf("day");
                                draft.to = moment().endOf("day");
                            })
                        }
                    >
                        {t("statistics.last6Months")}
                    </Button>
                    <Button
                        onClick={() =>
                            patchParams(draft => {
                                draft.from = moment().add(-1, "month").startOf("day");
                                draft.to = moment().endOf("day");
                            })
                        }
                    >
                        {t("statistics.lastMonth")}
                    </Button>
                    <Button
                        onClick={() =>
                            patchParams(draft => {
                                draft.from = moment().add(-1, "week").startOf("day");
                                draft.to = moment().endOf("day");
                            })
                        }
                    >
                        {t("statistics.lastWeek")}
                    </Button>
                    <Button
                        onClick={() =>
                            patchParams(draft => {
                                draft.from = moment().add(-1, "day").startOf("day");
                                draft.to = moment().add(-1, "day").endOf("day");
                            })
                        }
                    >
                        {t("statistics.yesterday")}
                    </Button>
                    <Button
                        onClick={() =>
                            patchParams(draft => {
                                draft.from = moment().startOf("day");
                                draft.to = moment().endOf("day");
                            })
                        }
                    >
                        {t("statistics.today")}
                    </Button>
                    <RangePicker
                        value={[params.from, params.to]}
                        onChange={period =>
                            patchParams(draft => {
                                draft.from = period[0];
                                draft.to = period[1];
                            })
                        }
                        allowClear={false}
                    />
                    <CountrySelector
                        value={params.country}
                        onChange={country =>
                            patchParams(draft => {
                                draft.country = country;
                            })
                        }
                        stats={statsByCountry}
                    />
                </Space>
            </Col>
            <Col span={24}>
                <StatusSelector
                    value={params.statuses}
                    onChange={statuses =>
                        patchParams(draft => {
                            draft.statuses = statuses;
                        })
                    }
                />
            </Col>
            <Col xl={12} md={24}>
                <SourcesAnalytics clients={clients} />
            </Col>
            <Col xl={12} md={24}>
                <ApplicationsAnalytics clients={clients} interval={interval} />
            </Col>
            <Col span={24}>
                <TopCountries stats={statsByCountry} clients={clients} />
            </Col>
        </>
    );
});
