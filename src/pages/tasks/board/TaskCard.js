import {List, Space, Statistic, Tag, Tooltip, Typography} from "antd";
import {color, clientColor, rateClient, leadName} from "../../../Helper";
import {Draggable} from "react-beautiful-dnd";
import {memo} from "react";
import {CardContainer, Ellipsis, FlexContainer, StyledCard} from "../../leads/LeadCard";
import styled from "styled-components";
import moment from "moment";
import {useHistory} from "react-router-dom";
import {getRating} from "../../Schedule";
import {FlagMaker} from "../../common/EditableFields";
import {getCountryCode} from "../../../data/countries";
import {Flex} from "../../../styled/flex";
import {ResponsibleManagerBadge} from "../../common/ResponsibleManagerBadge";
import {useTranslation} from "react-i18next";
const {Item} = List;
const {Paragraph} = Typography;
const {Countdown} = Statistic;
const StyledItem = styled(Item)`
    padding: 6px 0 !important;
`;

const TextWrapper = styled(Paragraph)`
    white-space: normal;
    margin: 0 !important;
`;

const StyledCountDown = styled(Countdown)`
    span {
        color: white;
        font-size: 1rem;
    }
`;

export const TaskCard = memo(({task, index, group}) => {
    const completeTill = moment(task.complete_till).format(
        group === "Today" || group === "Tomorrow" ? "HH:mm" : "DD MMMM HH:mm",
    );
    const overdue = moment().isAfter(moment(task.complete_till));
    const tomorrowOrLater = moment(task.complete_till).isSameOrAfter(moment().add(1, "day"), "day");
    const overdueDiff = moment().diff(moment(task.complete_till), "days");
    const completed = task.status === true;
    const history = useHistory();
    const {t} = useTranslation();
    return (
        <Draggable draggableId={`${task._id}`} key={task._id} index={index}>
            {provided => (
                <CardContainer ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    <StyledItem key={task._id} actions={[]}>
                        <StyledCard
                            color={
                                tomorrowOrLater
                                    ? color("cyan", 0)
                                    : completed
                                    ? color("green", 0)
                                    : overdue
                                    ? color("red", Math.floor(overdueDiff / 7))
                                    : color("grey", 0, 0.1)
                            }
                            extra={
                                <FlexContainer>
                                    <Tag
                                        style={{marginRight: 0}}
                                        color={color(task.lead.pipeline.color, task.lead.pipeline.colorLevel)}
                                    >
                                        {t(task.lead.pipeline.name)}
                                    </Tag>
                                    <ResponsibleManagerBadge style={{marginLeft: "5px"}} login={task.responsible} />
                                </FlexContainer>
                            }
                            onClick={() => {
                                history.push(`../../leads/${task.lead._id}`);
                            }}
                            hoverable
                            size="small"
                            title={
                                <Ellipsis>
                                    <Space>
                                        {task.lead?.country && (
                                            <FlagMaker country={getCountryCode(task.lead.country)} />
                                        )}
                                        {rateClient(task.lead) > 0 && (
                                            <span style={{color: color("gold")}}>{getRating(task.lead)}</span>
                                        )}
                                        <a style={{color: clientColor(task.lead)}} href="#/">
                                            {leadName(task.lead)}
                                        </a>
                                    </Space>
                                </Ellipsis>
                            }
                        >
                            <Flex justifyBetween>
                                <TextWrapper ellipsis>{task.text}</TextWrapper>
                                <Tooltip title={<StyledCountDown value={moment(task.complete_till)} />}>
                                    {completeTill}
                                </Tooltip>
                            </Flex>
                        </StyledCard>
                    </StyledItem>
                </CardContainer>
            )}
        </Draggable>
    );
});
