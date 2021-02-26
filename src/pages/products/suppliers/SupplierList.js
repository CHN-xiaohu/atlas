import {Link} from "react-router-dom";
import {Affix, Divider, Space, Table, Typography, Popover} from "antd";
import {Fragment, memo, useState} from "react";
import styled from "styled-components";
import {findCategory} from "../../Products";
import {HashLink} from "react-router-hash-link";
import {useQuery} from "react-query";
import {firstSuitable} from "../../../data/productFields";
import i18next from "i18next";
import {useTranslation} from "react-i18next";
import {setGlobalState} from "../../../hooks/useGlobalState";
import {SupplierTooltip} from "./SupplierStatus";
import {FactoryLocation} from "./FactoryLocation";
import {Flex} from "styled/flex";
import {colorMapping} from "./FactoryLocation";
const {Text} = Typography;

const StyledTable = styled(Table)`
    tr.active td {
        background-color: #e6f7ff;
    }
`;

const TurnoverWrapper = styled(Flex)`
    display: inline-flex;
    .mark {
        font-size: 10px;
    }
`;

const calcDeltaTurnover = (cur, last) => ({
    delta: cur - last,
    percent: Math.floor(last !== 0 ? (cur - last) / last : cur !== 0 ? 1 : 0) * 100,
})

const formatNumber = number => {
    const lng = localStorage.getItem("system-language");
    const {base, sign} = lng === "zh" ? {base: 10000, sign: ["万", "亿", "兆"]} : {base: 1000, sign: ["K", "KK", "KKK"]};
    // eslint-disable-next-line immutable/no-let
    let i = -1;
    while(number >= base) {
        number /= base;
        i++;
    };
    const value = new Intl.NumberFormat(lng, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(number)
    return value + (i > -1 ? sign[i] : "");
}

const Turnover = memo(({cur, last}) => {
    const {t} = useTranslation();
    const {delta: deltaTurnover, percent: turnoverPercent} = calcDeltaTurnover(cur.sumForClient, last.sumForClient);
    const {delta: deltaInterest, percent: interestPercent} = calcDeltaTurnover(cur.interest, last.interest);
    return (
        <TurnoverWrapper alignCenter>
            <Popover title={null} content={
                <Space direction="vertical">
                    <Text>{`${t("products.turnover")} ¥： ${formatNumber(deltaTurnover)} ${turnoverPercent}%`}</Text>
                    <Text>{`${t("products.profit")} ¥： ${formatNumber(deltaInterest)} ${interestPercent}%`}</Text>
                </Space>


            }>
                <Text>{formatNumber(cur.sumForClient)}</Text>
                {deltaTurnover > 0 ? <Text type="success">↑</Text> : deltaTurnover < 0 ? <Text type="danger">↓</Text> : ""}
            </Popover>
        </TurnoverWrapper>
    );
});

const colorDistanceMap = {
    red: 1,
    volcano: 2,
    orange: 3,
    gold: 4,
    green: 5,
}

const calcFactoryDistance = factories => {
    if (!Array.isArray(factories) || factories?.length === 0) return 0;
    const factory = factories[0];
    if (typeof factory === "object" && Object.keys(factory) === 0) return 0;
    const address = factory[Object.keys(factory).find(key => key.startsWith("location"))]; //找到地址
    const color =
        Object.keys(colorMapping).find(color => {
            return colorMapping[color].find(location => address?.includes(location)) != null;
        }) ?? "red";
    return colorDistanceMap[color];
}

const generateColumns = (t, setFilters, {styles: styleWords, data, filteredInfo}) => {
    const styleFilters = [...data?.reduce((styles, row) => styles.add(...(row.styles ?? [])), new Set())]
        .filter(style => style != null)
        .map(style => {
            const word = styleWords.find(s => s.key === style);
            const label = word == null ? style : firstSuitable([word[i18next.language], word.en, word.key]);
            return {text: label, value: word?.key ?? label};
        });
    const categoriesFilters = [
        ...data?.reduce((categories, row) => categories.add(...(row.categories ?? [])), new Set()),
    ]
        .filter(category => category != null)
        .map(category => {
            const cat = findCategory(category);
            return {text: t(cat?.label), value: cat?.key ?? cat};
        });
    return [
        {
            dataIndex: "name",
            title: t("products.name"),
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name, row) => (
                <Space>
                    <Link to={`/products/suppliers/${row._id}`}>
                        <div id={name.trim()[0].toUpperCase()}>{name}</div>
                    </Link>
                    <SupplierTooltip status={row.status} />
                </Space>
            ),
        },
        {
            dataIndex: "turnover0-3",
            title: t("products.turnover") + " ¥",
            width: 100,
            sorter: {
                compare: (a, b) => a["turnover0-3"].sumForClient - b["turnover0-3"].sumForClient,
                multiple: 3,
            },
            render: (_, row) => {
                const curTurnOver = row["turnover0-3"];
                const lastTurnOver = row["turnover3-6"];
                return (
                    <Turnover
                        title={t("products.sumForClient")}
                        cur={curTurnOver}
                        last={lastTurnOver}
                    />
                );
            },
        },
        {
            dataIndex: "productCount",
            title: t("products.products"),
            sorter: {
                compare: (a, b) => a.productCount - b.productCount,
                multiple: 2,
            },
        },
        {
            dataIndex: "factories",
            title: t("products.Location"),
            render: factories => {
                if (Array.isArray(factories) && factories?.length > 0) {
                    return <FactoryLocation factories={factories} />;
                }
                return null
            },
            sorter: {
                compare: (a, b) => calcFactoryDistance(a?.factories) - calcFactoryDistance(b?.factories),
                multiple: 1
            }
        },
        {
            dataIndex: "styles",
            title: t("products.styles"),
            filters: styleFilters,
            filteredValue: filteredInfo.styles ?? null,
            onFilter: (value, record) => record?.styles.includes(value),
            render: (styles, {_id}) => {
                if (styles.length === 0) {
                    return "—";
                }
                return styles.map((style, i) => {
                    const word = styleWords.find(s => s.key === style);
                    const label = word == null ? style : firstSuitable([word[i18next.language], word.en, word.key]);
                    return (
                        <span key={`${_id}-${style}`}>
                            <Link
                                onClick={() =>
                                    setFilters(draft => {
                                        draft.styles = [style];
                                    })
                                }
                                to={`/products/suppliers/${_id}`}
                            >
                                {label}
                            </Link>
                            {i !== styles.length - 1 && ", "}
                        </span>
                    );
                });
            },
        },
        {
            dataIndex: "categories",
            title: t("products.categories"),
            filters: categoriesFilters,
            filteredValue: filteredInfo.categories ?? null,
            onFilter: (value, record) => record?.categories.includes(value),
            render: (categories, supplier) => {
                if (categories.length === 0) {
                    return "—";
                }
                return categories.map((category, i) => {
                    const cat = findCategory(category);
                    return (
                        <span key={`${supplier?._id}-${cat?.key}`}>
                            <Link to={`/products/suppliers/${supplier._id}/grid/${cat?.key}`}>{t(cat?.label)}</Link>
                            {i !== categories.length - 1 && ", "}
                        </span>
                    );
                });
            },
        },
    ];
};

const AffixPanel = styled.div`
    padding: 0.5rem 0;
    background-color: white;
`;

const setFilters = value => setGlobalState("products-filters", value);

export const SuppliersList = memo(({data = []}) => {
    const {data: styles} = useQuery([
        "dictionaries",
        {
            method: "byName",
            name: "styles",
        },
    ]);
    const {t} = useTranslation();
    const [filteredInfo, setFilteredInfo] = useState({});
    const columns = generateColumns(t, setFilters, {styles: styles?.words ?? [], data, filteredInfo});
    return (
        <StyledTable
            title={() => (
                <Affix offsetTop={10}>
                    <AffixPanel>
                        {data?.length > 0 &&
                            data
                                .reduce((letters, item) => {
                                    const letter = item.name.trim()[0].toUpperCase();
                                    if (!letters.includes(letter)) {
                                        return [...letters, letter];
                                    }
                                    return letters;
                                }, [])
                                .sort((a, b) => a.localeCompare(b, "zh-CN"))
                                .map((letter, i, data) => (
                                    <Fragment key={letter}>
                                        <HashLink to={`#${letter}`}>{letter}</HashLink>
                                        {i !== data.length - 1 && <Divider type="vertical" />}
                                    </Fragment>
                                ))}
                    </AffixPanel>
                </Affix>
            )}
            rowKey="_id"
            size="small"
            columns={columns}
            dataSource={data}
            pagination={false}
            onChange={(pagination, filters, sorter) => setFilteredInfo(filters)}
        />
    );
});
