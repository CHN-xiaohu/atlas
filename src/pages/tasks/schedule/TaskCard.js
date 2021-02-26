import moment from "moment";
import {useHistory} from "react-router-dom";
import {clientColor, color, leadName, rateClient} from "../../../Helper";
import {Flex} from "../../../styled/flex";
import {Card, Statistic, Typography} from "antd";
import {getRating} from "../../Schedule";
import {memo} from "react";
import styled from "styled-components";
import {FlagMaker} from "../../common/EditableFields";
import {getCountryCode} from "../../../data/countries";
import {ResponsibleManagerBadge} from "../../common/ResponsibleManagerBadge";
import {useQuery} from "react-query";

const {Countdown} = Statistic;

const StyledCountdown = styled(Countdown)`
    display: inline !important;
    .ant-statistic-content {
        color: inherit;
        display: inline !important;
        font-size: 1em !important;
    }
`;

const StyledCard = styled(Card)`
    > .ant-card-body {
        padding-top: 5px !important;
        padding-bottom: 5px !important;
    }
    margin-bottom: 8px !important;
`;

const {Text} = Typography;

const priorityMap = {
    high: 1,
    middle: 0,
    low: 0,
};

const taskColor = task => {
    const time = moment(task.complete_till);
    const fineTime = time.clone().add(1, "hour");
    const overdue = !task.status && moment().isAfter(time);
    const priority = task.priority ?? "middle";
    const background = overdue ? (moment().isBefore(fineTime) ? "yellow" : "red") : "green";
    return color(background, priorityMap[priority], priority === "low" ? 0.2 : 1);
};

export const TaskCard = memo(({task}) => {
    const time = moment(task.complete_till);
    const history = useHistory();
    const countdown = moment().isAfter(time) && moment().isBefore(time.clone().add(1, "hour"));
    const {data: users} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    return (
        <StyledCard
            hoverable
            size="small"
            style={{
                backgroundColor: taskColor(task),
                borderLeft: `3px solid ${color(task.lead.pipeline.color, task.lead.pipeline.colorLevel)}`,
            }}
            onClick={() => history.push(`/leads/${task.lead._id}`)}
        >
            <Flex justifyBetween>
                <Text ellipsis>
                    <ResponsibleManagerBadge user={users.find(user => user.login === task.responsible)} />
                    <span>
                        {countdown ? (
                            <StyledCountdown value={time.clone().add(1, "hour")} format="mm:ss" />
                        ) : (
                            time.format("HH:mm")
                        )}
                    </span>
                    {task.lead?.country && (
                        <FlagMaker style={{marginLeft: "5px"}} country={getCountryCode(task.lead.country)} />
                    )}
                    {rateClient(task.lead) > 0 && (
                        <span style={{color: color("gold"), marginLeft: "5px"}}>{getRating(task.lead)}</span>
                    )}
                    <span style={{color: clientColor(task.lead), marginLeft: "5px"}}>{leadName(task.lead)}</span>
                </Text>
                <Text ellipsis>{task.text}</Text>
            </Flex>
        </StyledCard>
    );
});
