import {Flex} from "../../../styled/flex";
import {LoadingOutlined} from "@ant-design/icons";
import {memo} from "react";
import {Card, Progress, Statistic} from "antd";
import {Droppable} from "react-beautiful-dnd";
import {ScheduleCard} from "./ScheduleCard";
import moment from "moment";
import styled from "styled-components";
import {color} from "../../../Helper";

const TimeFrame = styled(Card.Grid)`
    width: 100% !important;
    background-color: ${props => props.active && color("green", 0)};
`;

const Placeholder = memo(({hour}) => {
    return <span>{`${hour.format("HH:mm")} –  ${hour.clone().add(1, "hour").format("HH:mm")}`}</span>;
});

const DayContainer = styled(Card)`
    text-align: center;
    > .ant-card-body {
        padding: 0 !important;
    }
`;

const sorter = (a, b) => moment(a.complete_till).unix() - moment(b.complete_till).unix();

export const TimePlanner = memo(
    ({
        active = [],
        all = [],
        start = moment({hours: 10, minutes: 0}),
        finish = moment({hours: 19, minutes: 0}),
        loading,
        period = "????????",
        day,
        droppable = false,
    }) => {
        const workingTime = moment.range(start, finish);
        const byHours = Array.from(workingTime.by("hour"));
        const beforeWork = all
            .filter(task => {
                const completeTime = moment(task.complete_till);
                const pureTime = moment({
                    hours: completeTime.hours(),
                    minutes: completeTime.minutes(),
                });
                return pureTime.isBefore(
                    moment({
                        hours: start.hours(),
                        minutes: start.minutes(),
                    }),
                );
            })
            .sort(sorter);
        const afterWork = all
            .filter(task => {
                const completeTime = moment(task.complete_till);
                const pureTime = moment({
                    hours: completeTime.hours(),
                    minutes: completeTime.minutes(),
                });
                return pureTime.isAfter(
                    moment({
                        hours: finish.hours(),
                        minutes: finish.minutes(),
                    }),
                );
            })
            .sort(sorter);
        return (
            <DayContainer
                title={
                    <Flex justifyBetween alignCenter>
                        {loading ? (
                            <LoadingOutlined spin />
                        ) : (
                            <Statistic value={active.length - all.length} suffix={`/ ${active.length}`} />
                        )}
                        {period}
                        {loading ? (
                            <LoadingOutlined spin />
                        ) : (
                            <Progress
                                type="circle"
                                percent={Math.floor(((active.length - all.length) / active.length) * 100)}
                                width={50}
                            />
                        )}
                    </Flex>
                }
            >
                <TimeFrame key={`before-work`}>
                    <Droppable droppableId={"before-work"} isDropDisabled={true}>
                        {droppable => (
                            <div key={"before-work"} ref={droppable.innerRef} {...droppable.droppableProps}>
                                {beforeWork.length === 0 && "Before 10:00"}
                                {beforeWork.map((task, i) => (
                                    <ScheduleCard key={task._id} task={task} index={i} />
                                ))}
                                {droppable.placeholder}
                            </div>
                        )}
                    </Droppable>
                </TimeFrame>
                {byHours.map(hour => {
                    const hourForDay =
                        day != null ? day.clone().set({hours: hour.hours(), minutes: hour.minutes()}) : hour;
                    const tasksforThisHour = all
                        .filter(task => {
                            const completeTime = moment(task.complete_till);
                            const pureTime = moment({
                                hours: completeTime.hours(),
                                minutes: completeTime.minutes(),
                            });
                            return moment({
                                hours: hour.hours(),
                                minutes: hour.minutes(),
                            }).isSame(pureTime, "hour");
                        })
                        .slice()
                        .sort(sorter);
                    const droppableId = `${hourForDay.unix()}|${period}`;
                    return (
                        <TimeFrame active={moment().isSame(hour, "hour")} key={`timeframe${droppableId}`}>
                            <Droppable droppableId={droppableId} isDropDisabled={!droppable}>
                                {droppable => (
                                    <div key={droppableId} ref={droppable.innerRef} {...droppable.droppableProps}>
                                        {tasksforThisHour.length === 0 && <Placeholder hour={hour} />}
                                        {tasksforThisHour.map((task, index) => {
                                            return <ScheduleCard task={task} index={index} key={task._id} />;
                                        })}
                                        {droppable.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </TimeFrame>
                    );
                })}
                <TimeFrame key={`after-work`}>
                    <Droppable droppableId={"after-work"} isDropDisabled={true}>
                        {droppable => (
                            <div key={"after-work"} ref={droppable.innerRef} {...droppable.droppableProps}>
                                {afterWork.length === 0 && "After 19:00"}
                                {afterWork.map((task, i) => (
                                    <ScheduleCard index={i} key={task._id} task={task} />
                                ))}
                                {droppable.placeholder}
                            </div>
                        )}
                    </Droppable>
                </TimeFrame>
            </DayContainer>
        );
    },
);
