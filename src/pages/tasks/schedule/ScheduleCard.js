import {Draggable} from "react-beautiful-dnd";
import { memo } from "react";
import {TaskCard} from "./TaskCard";
export const ScheduleCard = memo(({task, index}) => {
    return (
        <Draggable draggableId={`${task._id}`} key={task._id} index={index}>
            {provided => (
                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    <TaskCard task={task} />
                </div>
            )}
        </Draggable>
    );
});
