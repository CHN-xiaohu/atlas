import { memo } from "react";
import {Col, Empty, Row} from "antd";
import {Spinner} from "../common/Spinner";
import {DragDropContext} from "react-beautiful-dnd";
import moment from "moment";
import styled from "styled-components";
import {TasksColumn} from "./board/TasksColumn";
import ScrollContainer from "react-indiana-drag-scroll";
import {useDataMutation} from "../../hooks/useDataMutation";
import {useTranslation} from "react-i18next";
import {useQueryClient} from "react-query";

const completeTill = task => moment(task.complete_till);

const splitTasksToGroup = tasks => {
    const grouped = tasks.reduce(
        (storage, task) => {
            const time = completeTill(task);
            const now = moment();
            if (time.isBefore(now.clone().startOf("day")) && task.status === false) {
                storage.Overdue.push(task);
                return storage;
            }
            if (time.isSame(now, "day")) {
                storage.Today.push(task);
                return storage;
            }
            if (time.isSame(now.clone().add(1, "day"), "day")) {
                storage.Tomorrow.push(task);
                return storage;
            }
            if (time.isAfter(now) && time.isBefore(now.clone().add(1, "week"))) {
                storage["Within a week"].push(task);
                return storage;
            }
            if (time.isAfter(now) && time.isBefore(now.clone().add(1, "month"))) {
                storage["Within a month"].push(task);
                return storage;
            }
            if (time.isAfter(now)) {
                if (!Array.isArray(storage["Later"])) {
                    storage["Later"] = [];
                }
                storage["Later"].push(task);
            }
            return storage;
        },
        {
            Overdue: [],
            Today: [],
            Tomorrow: [],
            "Within a week": [],
            "Within a month": [],
            Later: [],
        },
    );
    // eslint-disable-next-line
    for (let group in grouped) {
        if (grouped[group].length === 0 && group !== "Tomorrow" && group !== "Today") {
            delete grouped[group];
        }
    }
    return grouped;
};

const StyledRow = styled(Row).attrs({
    type: "flex",
})`
    justify-content: space-around;
`;

const StyledScrollContainer = styled(ScrollContainer)`
    overflow: auto;
    display: flex;
    justify-content: space-around;
`;

const getDay = time => {
    const year = time.year();
    const month = time.month();
    const date = time.date();
    return {year, month, date};
};

const getNewTaskCompleteTime = (complete_till, group) => {
    const time = moment(complete_till);
    if (group === "Tomorrow") {
        const tomorrow = moment().add(1, "day");
        return time.set(getDay(tomorrow));
    }
    if (group === "Today") {
        const today = moment();
        return time.set(getDay(today));
    }
    if (group === "Within a week") {
        //need debug
        const today = moment().add(6 - time.day(), "days");
        return time.set(getDay(today));
    }
};

const Container = styled.div`
    white-space: nowrap;
    width: 100%;
`;

export const TasksBoard = memo(({data, loading}) => {
    const queryClient = useQueryClient()
    const tasks = data.filter(task => task.status === false);
    const taskGroups = splitTasksToGroup(tasks);
    const {mutate: changeTaskCompleteTime} = useDataMutation("/tasks/reschedule", {
        onSuccess: () => {
            queryClient.invalidateQueries("tasks");
        },
    });
    const {t} = useTranslation();
    return (
        <StyledRow>
            <Col span={24}>
                <StyledScrollContainer style={{overflow: "auto"}} ignoreElements=".ant-card">
                    {tasks.length === 0 && loading && <Spinner />}
                    {tasks.length === 0 && !loading && <Empty description={t("tasks.allTasksAreCompleted")} />}
                    {tasks.length > 0 && (
                        <Container>
                            <DragDropContext
                                onDragEnd={({draggableId, source, destination}) => {
                                    if (destination != null && destination.droppableId !== source.droppableId) {
                                        const newTime = getNewTaskCompleteTime(
                                            tasks.find(task => task._id === draggableId).complete_till,
                                            destination.droppableId,
                                        );
                                        changeTaskCompleteTime({_id: draggableId, time: newTime.toDate()});
                                        console.log(
                                            "move",
                                            tasks.find(task => task._id === draggableId),
                                            "to",
                                            destination.droppableId,
                                            "time:",
                                            moment(newTime).fromNow(),
                                        );
                                    }
                                }}
                            >
                                {Object.keys(taskGroups).map(group => {
                                    return (
                                        <TasksColumn
                                            droppable={group === "Today" || group === "Tomorrow" || true}
                                            key={group}
                                            group={group}
                                            tasks={taskGroups[group]}
                                        />
                                    );
                                })}
                            </DragDropContext>
                        </Container>
                    )}
                </StyledScrollContainer>
            </Col>
        </StyledRow>
    );
});
