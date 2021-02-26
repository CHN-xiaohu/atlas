import {memo, useCallback} from "react";
import moment from "moment";
import {ClockCircleOutlined, IdcardOutlined} from "@ant-design/icons";
import {Avatar, Button, DatePicker, List, Space, Statistic, Typography} from "antd";
import {clientColor, dollars, Link, showDataRange, leadName, rateClient, usd} from "../../Helper";
import styled from "styled-components";
import {Flex} from "../../styled/flex";
import {FlagMaker} from "../common/EditableFields";
import {getCountryCode} from "../../data/countries";
import {Stars} from "../common/Stars";
import {useTranslation} from "react-i18next";
import {useQuery} from "react-query";
import {useSocketStorage} from "../../hooks/useSocketStorage";
import {useState} from "react";

const {Title} = Typography;
const {RangePicker} = DatePicker;

const StyledStatistic = styled(Statistic)`
    .ant-statistic-content {
        font-size: inherit;
    }
`;

export const Discarded = memo(({history, search}) => {
    const {t} = useTranslation();
    const [period, setPeriod] = useState([null, null]);
    // const [period, setPeriod] = useState([moment().year(2019).month(0).date(1), moment().endOf("day")]);
    const rates = useSocketStorage("forex");
    const rate = usd(rates);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const onPaginationChange = useCallback(page => setPage(page), [setPage]);
    const onShowSizeChange = useCallback(
        (_, size) => {
            setPageSize(size);
        },
        [setPageSize],
    );
    const pagination = {
        current: page,
        pageSize: pageSize,
        onChange: onPaginationChange,
        onShowSizeChange: onShowSizeChange,
        showQuickJumper: true,
        responsive: true,
        hideOnSinglePage: true,
    };
    const since = period[0] != null ? period[0].toDate() : null;
    const till = period[1] != null ? period[1].toDate() : null;

    const {data: leads, isLoading} = useQuery([
        "leads",
        {
            method: "discarded",
            search,
            since,
            till,
            sort: {
                updated_at: -1,
            },
            skip: pageSize * page - pageSize,
            limit: pageSize,
        },
    ]);
    const {data: leadsCount} = useQuery([
        "leads",
        {
            method: "discardedCount",
            search,
            since,
            till,
        },
    ]);
    return (
        <>
            <Flex justifyBetween>
                <Title level={4}>
                    {t("leads.discardedWithin")} {since != null && till != null && showDataRange(...period)}
                </Title>
                <div>
                    <RangePicker
                        value={period}
                        onChange={period => {
                            if (period == null) {
                                setPeriod([null, null]);
                            } else {
                                setPeriod([period[0].startOf("day"), period[1].endOf("day")]);
                            }
                        }}
                    />
                </div>
            </Flex>
            <List
                loading={isLoading}
                dataSource={leads}
                pagination={{
                    total: leadsCount,
                    ...pagination,
                }}
                renderItem={lead => {
                    const rating = rateClient(lead);
                    const index = leads.indexOf(lead);
                    return (
                        <List.Item
                            key={lead._id}
                            actions={[
                                <Button
                                    icon={<IdcardOutlined />}
                                    onClick={() => {
                                        history.push(`/leads/${lead._id}`);
                                    }}
                                >
                                    {t("leads.lead")}
                                </Button>,
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar shape="circle">{index + 1}</Avatar>}
                                title={
                                    <Space>
                                        {lead.country && <FlagMaker country={getCountryCode(lead.country)} />}
                                        {rating > 0 && (
                                            <span>
                                                <Stars count={rating} />
                                            </span>
                                        )}
                                        <Link
                                            style={{color: clientColor(lead)}}
                                            onClick={() => {
                                                history.push(`/leads/${lead._id}`);
                                            }}
                                        >
                                            {leadName(lead)}
                                        </Link>
                                        {!isNaN(lead.price) && (
                                            <span>{dollars(Math.round(lead.price / rate), "$")}</span>
                                        )}
                                        <span>
                                            {t("leads.discarded")} {moment(lead.updated_at).fromNow()}
                                        </span>
                                    </Space>
                                }
                            />
                            <StyledStatistic
                                title={t("leads.inTheWork")}
                                value={moment
                                    .duration(
                                        moment(lead.updated_at).unix() - moment(lead.created_at).unix(),
                                        "seconds",
                                    )
                                    .humanize()}
                                prefix={<ClockCircleOutlined />}
                            />
                        </List.Item>
                    );
                }}
            />
        </>
    );
});
