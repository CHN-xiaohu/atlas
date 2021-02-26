import {Droppable} from "react-beautiful-dnd";
import {List} from "antd";
import {TaskCard} from "./TaskCard";
import { memo } from "react";
import styled from "styled-components";
import {Column} from "../../leads/LeadColumn";
import {Flex} from "../../../styled/flex";
import moment from "moment";
import {useTranslation} from "react-i18next";

const TaskColumn = styled(Column)`
    width: ${props => props.width};
`;

export const priority = [20674270, 20674273, 20674288, 23674579, 28521454, 22115713, 22283386, 23674879, 22596196];

const tasksSorter = (a, b) => {
    const leadA = a.lead || {};
    const leadB = b.lead || {};

    if (leadA.status_id !== leadB.status_id) {
        return priority.findIndex(s => s === leadA.status_id) - priority.findIndex(s => s === leadB.status_id);
    }
    if (a.complete_till !== b.complete_till) {
        return moment(a.complete_till).unix() - moment(b.complete_till).unix();
    }
    return a.text.toString().localeCompare(b.text);
};

export const TasksColumn = memo(({group, tasks, droppable = true, width = "500px", sorter = tasksSorter}) => {
    const {t} = useTranslation();
    const sortedTasks = tasks.slice().sort(sorter);
    return (
        <TaskColumn key={group} width={width}>
            <Flex center justifyAround>
                <h3>
                    {group} — {tasks.length} {t("tasks.tasks")}
                </h3>
            </Flex>
            {droppable && (
                <Droppable droppableId={group}>
                    {droppable => (
                        <div ref={droppable.innerRef} {...droppable.droppableProps}>
                            {droppable.placeholder}
                            <List
                                dataSource={sortedTasks}
                                renderItem={(task, index) => <TaskCard task={task} index={index} group={group} />}
                            />
                        </div>
                    )}
                </Droppable>
            )}
            {!droppable && (
                <List
                    dataSource={sortedTasks}
                    renderItem={(task, index) => <TaskCard task={task} index={index} group={group} />}
                />
            )}
        </TaskColumn>
    );
});
