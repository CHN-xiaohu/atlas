import { memo } from "react";
import {Col, Row} from "antd";
import {DragDropContext} from "react-beautiful-dnd";
import styled from "styled-components";
import {nextWorkingDay} from "../../Helper";
import {Day} from "./schedule/Day";
import moment from "moment";
import {TimePlanner} from "./schedule/TimePlanner";
import {useDataMutation} from "../../hooks/useDataMutation";
import {useQueryClient} from "react-query";

const StyledRow = styled(Row).attrs({
    type: "flex",
})``;

const nextWDay = nextWorkingDay();
const now = moment();

export const TasksSchedule = memo(({data: tasks, loading, settings}) => {
    const queryClient = useQueryClient()
    const {mutate: changeTaskCompleteTime} = useDataMutation("/tasks/reschedule", {
        onSuccess: () => {
            queryClient.invalidateQueries("tasks");
        },
    });

    const overdue = tasks.filter(task => {
        return task.status === false && moment(task.complete_till).isBefore(now.startOf("day"));
    });
    const future = tasks.filter(task => {
        return moment(task.complete_till).isAfter(nextWDay.endOf("day"));
    });

    return (
        <StyledRow gutter={[36, 36]}>
            <DragDropContext
                onDragEnd={({draggableId, source, destination}) => {
                    console.log(draggableId, source, destination);
                    if (destination != null && destination.droppableId !== source.droppableId) {
                        const desiredTime = moment.unix(destination.droppableId.split('|')[0]);
                        const task = tasks.find(task => task._id === draggableId);
                        //console.log(draggableId, source, destination);
                        console.log(
                            "move",
                            tasks.find(task => task._id === draggableId),
                            "to",
                            desiredTime.format("HH:mm"),
                        );
                        changeTaskCompleteTime({
                            _id: task._id,
                            time: desiredTime.minutes(moment(task.complete_till).minutes()).toDate(),
                        });
                    }
                }}
            >
                <Col span={8}>
                    <TimePlanner all={overdue} active={overdue} period={"Overdue"} loading={loading} />
                </Col>
                <Col span={8}>
                    <Day
                        day={now}
                        tasks={tasks.filter(task => now.isSame(task.complete_till, "day"))}
                        settings={settings}
                    />
                </Col>
                <Col span={8}>
                    <Day
                        day={nextWDay}
                        tasks={tasks.filter(task => nextWDay.isSame(task.complete_till, "day"))}
                        settings={settings}
                    />
                </Col>
                <Col span={8}>
                    <TimePlanner
                        all={future}
                        active={future.filter(task => task.status !== true)}
                        period={"Future"}
                        loading={loading}
                    />
                </Col>
            </DragDropContext>
        </StyledRow>
    );
});
