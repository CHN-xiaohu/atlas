import {memo, useCallback} from "react";
import {Draggable} from "react-beautiful-dnd";
import {DollarCircleFilled} from "@ant-design/icons";
import {Badge, Card, List, Space, Tag, Tooltip, Typography} from "antd";
import {dollars, showDataRange, smooth, color, isConfirmed, rateClient, clientColor, leadName, usd} from "../../Helper";
import styled from "styled-components";
import Moment from "moment";
import {extendMoment} from "moment-range";
import {useHistory} from "react-router-dom";
import {Flex} from "../../styled/flex";
import {FlagMaker} from "../common/EditableFields";
import {getCountryCode} from "../../data/countries";
import {ManagerBadge} from "./purchases/PurchasesList";
import {ResponsibleManagerBadge} from "../common/ResponsibleManagerBadge";
import {Stars} from "../common/Stars";
import {useQuery} from "react-query";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "../../hooks/useGlobalState";
import {useSocketStorage} from "../../hooks/useSocketStorage";

const moment = extendMoment(Moment);
const {Text} = Typography;
const {Item} = List;

export const CardContainer = styled.div`
    background: white;
`;

export const StyledCard = styled(Card)`
    width: 100%;
    background-color: ${props => props.color} !important;
`;

export const FlexContainer = styled(Flex).attrs({
    justifyBetween: true,
})``;

const TasksStatusBadge = styled(Badge)`
    padding-left: 8px !important;
`;

const StyledItem = styled(Item)`
    padding: 6px 0 !important;
`;

const AdditionalInfo = memo(({lead}) => {
    const {t} = useTranslation();
    const {managers, arrivalDate, departureDate, doNotDisturbTill, propertyType, propertySize} = lead;
    const suspended = moment(doNotDisturbTill).isAfter(moment());
    // eslint-disable-next-line immutable/no-let
    let info = [];
    if (lead.paidDeposit) {
        info.push(
            <Tooltip key="deposit" title={t("leads.paidTheDeposit")}>
                <DollarCircleFilled style={{color: color("gold"), fontSize: "1.6em"}} />
            </Tooltip>,
        );
    }
    if (Array.isArray(managers) && managers.length > 0) {
        info.push(
            managers.map(manager => (
                <ManagerBadge key={`manager-${manager?._id}`} manager={manager} full={managers.length === 1} />
            )),
        );
    }
    if (suspended) {
        info.push(
            <span key="suspended">
                {t("leads.suspendedTill")}: {moment(lead.doNotDisturbTill).format("MMMM Do")}
            </span>,
        );
        return <Space>{info}</Space>;
    }
    if (lead.online && lead.orderDate != null) {
        info.push(moment(lead.orderDate).format("MMMM"));
    }
    if (lead.online !== true && arrivalDate != null && departureDate != null) {
        info.push(showDataRange(moment(arrivalDate), moment(departureDate)));
    }
    if (propertyType != null && propertySize != null) {
        info.push(
            <span key="property">
                {propertyType} {propertySize}м<sup>2</sup>
            </span>,
        );
    }
    if (info.length > 0) {
        return <Space>{info}</Space>;
    }
    return "—";
});

const getColor = (lead, leadFields = []) => {
    const {doNotDisturbTill, arrivalDate, departureDate, created_at, status_id} = lead;
    const suspended = moment(doNotDisturbTill).unix() > moment().unix();
    const event = moment.range(moment(arrivalDate).startOf("day"), moment(departureDate).endOf("day"));
    if (suspended) {
        return color("blue", 0);
    }
    if (isConfirmed(status_id) && event.contains(moment())) {
        return color("cyan", 0);
    }
    if (moment().isAfter(moment(departureDate))) {
        return color("purple", 0);
    }
    if (moment(created_at).isAfter(moment().subtract(24, "hours"))) {
        return color("yellow", 0);
    }
    //leadFields.find(field => !field.hidden && typeof field.warn === "function" && field.warn(lead) === true) != null && console.log(lead, leadFields.find(field => !field.hidden && typeof field.warn === "function" && field.warn(lead) === true))
    if (
        leadFields.find(field => !field.hidden && typeof field.warn === "function" && field.warn(lead) === true) != null
    ) {
        return color("grey", 0, 0.1);
    }
    return "default";
};

export const Ellipsis = styled(Text).attrs({
    ellipsis: true,
})`
    display: inline !important;
`;

export const closestActiveTask = ({tasks = []}) => {
    const activeTasks = tasks.filter(task => task.status === false);
    if (activeTasks.length === 0) {
        return moment.unix(100000000000).toDate();
    }
    return activeTasks.reduce((a, b) => (moment(b.complete_till).unix() < moment(a.complete_till).unix() ? b : a))
        .complete_till;
};
export const doesLeadHaveOverdueTasks = ({tasks = []}) =>
    tasks.filter(
        task => task.complete_till != null && moment(task.complete_till).isBefore(moment()) && task.status === false,
    ).length > 0;
export const areTasksTodayCompleted = ({tasks}) => {
    const tasksToday = tasks.filter(task => moment(task.complete_till).isSame(moment(), "day"));
    const tasksCompleted = tasksToday.filter(task => task.status === true);
    return tasksToday.length > 0 && tasksToday.length === tasksCompleted.length;
};

const statuses = [
    {
        color: "red",
        prompt: "leads.leadHasOverdueTasks",
        active: lead => doesLeadHaveOverdueTasks(lead),
        processing: () => false,
    },
    {
        color: "green",
        prompt: "leads.leadHasActiveTasksForYou",
        active: (lead, user) =>
            moment(
                closestActiveTask({
                    ...lead,
                    tasks: lead.tasks.filter(task => task.responsible == null || task.responsible === user.login),
                }),
            ).isSame(moment(), "day"),
        processing: (lead, user) =>
            moment({
                ...lead,
                tasks: lead.tasks.filter(task => task.responsible == null || task.responsible === user.login),
            }).isBetween(moment(), moment().add(2, "hours")),
    },
    {
        color: "cyan",
        prompt: "leads.leadHasActiveTasksForSomeoneElse",
        active: lead => moment(closestActiveTask(lead)).isSame(moment(), "day"),
        processing: lead => moment(closestActiveTask(lead)).isBetween(moment(), moment().add(2, "hours")),
    },
    {
        color: "yellow",
        prompt: "leads.leadHasActiveTasksForTomorrow",
        active: lead => moment(closestActiveTask(lead)).isSame(moment().add(1, "day"), "day"),
        processing: () => false,
    },
    {
        color: "blue",
        prompt: "leads.allTasksTodayAreCompleted",
        active: lead => areTasksTodayCompleted(lead),
        processing: () => false,
    },
];

const TasksStatus = memo(({lead, user}) => {
    const {t} = useTranslation();
    const status = statuses.find(status => status.active(lead, user));
    if (status == null) {
        return null;
    }
    const processing = status.processing(lead, user);
    return (
        <Tooltip title={t(status.prompt)}>
            <TasksStatusBadge status={processing ? "processing" : null} color={color(status.color)} />
        </Tooltip>
    );
});

const CardBody = memo(({innerRef, draggableProps, dragHandleProps, lead, fields}) => {
    const rates = useSocketStorage("forex");
    const forex = usd(rates);
    const tags = lead.tags || [];
    const history = useHistory();
    const rating = rateClient(lead);
    const cardColor = getColor(lead, fields);
    const {t} = useTranslation();
    const [user] = useGlobalState("user");
    const {data: users} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    return (
        <CardContainer ref={innerRef} {...draggableProps} {...dragHandleProps}>
            <StyledItem key={lead._id} actions={[]}>
                <StyledCard
                    onClick={() => {
                        history.push(`./${lead._id}`);
                    }}
                    color={cardColor}
                    extra={
                        <Flex>
                            {lead.price != null && lead.price > 0 && (
                                <Tooltip title={dollars(lead.price)}>
                                    <Ellipsis>{dollars(smooth(lead.price / forex), "$")}</Ellipsis>
                                </Tooltip>
                            )}
                            <ResponsibleManagerBadge
                                user={users.find(user => user.login === lead.responsible)}
                                style={{marginLeft: "5px"}}
                            />
                        </Flex>
                    }
                    hoverable
                    size="small"
                    title={
                        <Ellipsis>
                            {lead.country && (
                                <FlagMaker
                                    style={{marginRight: "5px"}}
                                    country={getCountryCode(lead.country)}
                                    size="lg"
                                />
                            )}
                            {rating > 0 && (
                                <span style={{marginRight: "5px"}}>
                                    <Stars count={rating} />
                                </span>
                            )}
                            <Tooltip
                                title={
                                    <span>
                                        {t("leads.createdAt")} {moment(lead.created_at).format("HH:mm DD MMMM")}
                                    </span>
                                }
                            >
                                <a style={{color: clientColor(lead)}} href="#/">
                                    {leadName(lead)}
                                </a>
                            </Tooltip>
                        </Ellipsis>
                    }
                >
                    <FlexContainer>
                        <Ellipsis>
                            <AdditionalInfo lead={lead} />
                        </Ellipsis>
                        <Space>
                            <div>
                                {tags.map(tag => (
                                    <Tag key={tag}>{tag}</Tag>
                                ))}
                            </div>
                            <TasksStatus lead={lead} user={user} />
                        </Space>
                    </FlexContainer>
                </StyledCard>
            </StyledItem>
        </CardContainer>
    );
});

export const LeadCard = memo(({lead, index, fields}) => {
    const generateCard = useCallback(provided => <CardBody fields={fields} lead={lead} {...provided} />, [
        lead,
        fields,
    ]);
    return (
        <Draggable draggableId={`${lead._id}`} key={lead._id} index={index}>
            {generateCard}
        </Draggable>
    );
});
