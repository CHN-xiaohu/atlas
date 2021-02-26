import {isConfirmed, color, showDataRange, dollars, clientColor, leadName, usd} from "../../Helper";
import {Descriptions, List, Space, Tag, Tooltip} from "antd";
import {memo} from "react";
import Moment from "moment";
import {extendMoment} from "moment-range";
import {Link} from "react-router-dom";
import {colorMap, tooltipMap} from "../leads/purchases/PurchasesList";
import styled from "styled-components";
import {getCountryCode} from "../../data/countries";
import {FlagMaker} from "../common/EditableFields";
import {useTranslation} from "react-i18next";
import {useSocketStorage} from "../../hooks/useSocketStorage";
const moment = extendMoment(Moment);

const PureTag = styled(Tag)`
    margin: 0 !important;
`;

export const MonthSchedule = memo(({day}) => {
    const {t} = useTranslation();
    //const selector = useCallback(currentMonthSelector(day), [day]);
    //const clients = useSelector(selector);
    const clients = [];
    const rates = useSocketStorage('forex');
    const forex = usd(rates);
    return (
        <>
            <Descriptions column={2}>
                <Descriptions.Item label={t("schedule.totalClients")}>{clients.length}</Descriptions.Item>
                <Descriptions.Item label={t("schedule.confirmed")}>
                    {clients.filter(lead => isConfirmed(lead.status_id)).length}
                </Descriptions.Item>
            </Descriptions>
            <List
                dataSource={clients}
                renderItem={client => {
                    return (
                        <List.Item
                            actions={[
                                <PureTag color={color(client.manager.color)}>{client.manager.manager}</PureTag>,
                                <Tooltip title={tooltipMap[client.status_id]}>
                                    <PureTag color={color(colorMap[client.status_id])}>
                                        {client.online
                                            ? moment(client.orderDate).format("MMMM YYYY")
                                            : showDataRange(moment(client.arrivalDate), moment(client.departureDate))}
                                    </PureTag>
                                </Tooltip>,
                            ]}
                        >
                            <List.Item.Meta
                                title={
                                    <Space>
                                        {client.country && <FlagMaker country={getCountryCode(client.country)} />}
                                        <Link to={`/leads/${client._id}`} style={{color: clientColor(client)}}>
                                            {leadName(client)}
                                        </Link>
                                    </Space>
                                }
                                description={`${dollars(Math.round(client.price / forex), "$")} ${client.propertyType}`}
                            />
                        </List.Item>
                    );
                }}
            />
        </>
    );
});
