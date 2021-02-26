import styled from "styled-components";
import {Button, Col, Row, Select, Space, DatePicker, Input} from "antd";
import {memo, useCallback} from "react";
import {color} from "../../../Helper";
import {ManagersMenu} from "../../common/ManagersMenu";
import moment from "moment";
import {ButtonsMenu} from "../../common/ButtonsMenu";
import {ClockCircleTwoTone, CloseCircleOutlined, SafetyCertificateTwoTone} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import i18next from "i18next";
import {useQuery} from "react-query";
import {firstSuitable} from "../../../data/productFields";
import {defaultState, useGlobalState} from "../../../hooks/useGlobalState";
import {ResetFiltersButton} from "./ResetFiltersButton";
import {SearchImageButton} from "./SearchImageButton";
import {LimitedView} from "../../common/LimitedView";
import {Flex} from "../../../styled/flex";
import produce from "immer";

const {RangePicker} = DatePicker;
const {Search} = Input;

const StyledSelect = styled(Select)`
    width: 100%;
    min-width: 250px;
`;

const Filter = memo(({value, options, update, ...props}) => {
    return (
        <StyledSelect maxTagsCount={2} mode="multiple" value={value} {...props} onChange={options => update(options)}>
            {options.map(option => (
                <Select.Option key={option.key} value={option.key}>
                    {option.label}
                </Select.Option>
            ))}
        </StyledSelect>
    );
});

const SortingSelector = memo(({onChange}) => {
    const {t} = useTranslation();
    return (
        <Select
            onChange={key => {
                onChange(key);
            }}
            defaultValue={t("products.allSuppliers")}
            style={{width: "160px"}}
        >
            <Select.Option key="null">{t("products.allSuppliers")}</Select.Option>
            <Select.Option key="average">{t("products.aboveGeneralSuppliers")}</Select.Option>
            <Select.Option key="like">{t("products.reliableSuppliers")}</Select.Option>
        </Select>
    );
});

const sorter = (a, b) => a.label.localeCompare(b.label);

export const Filters = memo(({displaySearch = false}) => {
    const [filters, setFilters] = useGlobalState("products-filters");
    const data = filters;
    const update = useCallback(
        (filter, value) =>
            setFilters(filters =>
                produce(filters, draft => {
                    if (value === "null" || value == null) {
                        delete draft[filter];
                    } else {
                        draft[filter] = value;
                    }

                    draft.skip = defaultState["products-filters"].skip;
                    draft.limit = defaultState["products-filters"].limit;
                }),
            ),
        [setFilters],
    );
    const setRange = range => update("range", range);
    const {t} = useTranslation();
    const {data: materials} = useQuery(
        [
            "dictionaries",
            {
                method: "byName",
                name: "materials",
            },
        ],
        {
            placeholderData: {
                words: [],
            },
        },
    );

    const {data: brands} = useQuery(
        [
            "dictionaries",
            {
                method: "byName",
                name: "brands",
            },
        ],
        {
            placeholderData: {
                words: [],
            },
        },
    );

    const {data: styles} = useQuery(
        [
            "dictionaries",
            {
                method: "byName",
                name: "styles",
            },
        ],
        {
            placeholderData: {
                words: [],
            },
        },
    );
    return (
        <div>
            <Row gutter={[24, 24]} display="flex">
                <Col span={24}>
                    <Flex justifyBetween>
                        <div>
                            <Space>
                                <Filter
                                    value={data.styles}
                                    options={styles.words
                                        .map(word => ({
                                            key: word.key,
                                            label: firstSuitable([word[i18next.language], word.en, word.key]),
                                        }))
                                        .sort(sorter)}
                                    update={value => update("styles", value)}
                                    placeholder={t("products.styles")}
                                />
                                <Filter
                                    value={data.materials}
                                    options={materials.words
                                        .map(word => ({
                                            key: word.key,
                                            label: firstSuitable([word[i18next.language], word.en, word.key]),
                                        }))
                                        .sort(sorter)}
                                    update={value => update("materials", value)}
                                    placeholder={t("products.materials")}
                                />
                                <Filter
                                    value={data.brands}
                                    options={brands.words
                                        .map(word => ({
                                            key: word.key,
                                            label: firstSuitable([word[i18next.language], word.en, word.key]),
                                        }))
                                        .sort(sorter)}
                                    update={value => update("brands", value)}
                                    placeholder={t("products.brands")}
                                />
                            </Space>
                        </div>
                        <div>
                            <Space>
                                <SortingSelector onChange={value => update("supplierStatus", value)} />
                                {displaySearch && (
                                    <>
                                        <Search
                                            style={{width: "100%"}}
                                            placeholder={t("products.searchHere")}
                                            defaultValue={filters.search}
                                            onSearch={value => {
                                                update("search", value);
                                            }}
                                            allowClear
                                        />

                                        <LimitedView groups={[(_g, user) => user.title === "developer"]}>
                                            <SearchImageButton
                                                value={filters.imageUri}
                                                onSearch={base64 => {
                                                    update("imageUri", base64);
                                                }}
                                                onCancelSearch={() => {
                                                    update("imageUri", null);
                                                }}
                                            />
                                        </LimitedView>
                                    </>
                                )}
                            </Space>
                        </div>
                    </Flex>
                </Col>
                <Col span={24}>
                    <Space>
                        <ResetFiltersButton />
                        <ButtonsMenu
                            options={[
                                {
                                    key: null,
                                    label: t("products.all"),
                                },
                                {
                                    key: "verified",
                                    icon: <SafetyCertificateTwoTone twoToneColor={color("green")} />,
                                    tooltip: t("products.verified"),
                                },
                                {
                                    key: "declined",
                                    icon: <CloseCircleOutlined style={{color: color("red")}} />,
                                    tooltip: t("products.declined"),
                                },
                                {
                                    key: "pending",
                                    icon: <ClockCircleTwoTone twoToneColor={color("blue")} />,
                                    tooltip: t("products.pending"),
                                },
                            ]}
                            activeKey={data.verification ?? null}
                            onChange={key => update("verification", key)}
                        />
                        <ManagersMenu
                            value={data.manager ?? null}
                            onClick={manager => update("manager", manager)}
                            group={g => true}
                            filter={user =>
                                user.title !== "developer" && user.title !== "administrator" && user.login !== "client"
                            }
                        />
                        <Button
                            onClick={() => setRange([moment().add(-1, "month").startOf("day"), moment().endOf("day")])}
                        >
                            {t("products.lastMonth")}
                        </Button>
                        <Button
                            onClick={() => setRange([moment().add(-1, "week").startOf("day"), moment().endOf("day")])}
                        >
                            {t("products.lastWeek")}
                        </Button>
                        <Button
                            onClick={() =>
                                setRange([moment().add(-1, "day").startOf("day"), moment().add(-1, "day").endOf("day")])
                            }
                        >
                            {t("products.yesterday")}
                        </Button>
                        <Button onClick={() => setRange([moment().startOf("day"), moment().endOf("day")])}>
                            {t("products.today")}
                        </Button>
                        <RangePicker
                            value={data.range}
                            onChange={range => {
                                const [start, end] = range;
                                setRange([start.startOf("day"), end.endOf("day")]);
                            }}
                            allowClear={true}
                            showTime={false}
                        />
                    </Space>
                </Col>
            </Row>
        </div>
    );
});
