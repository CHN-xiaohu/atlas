import { memo } from "react";
import moment from "moment";
import {TimePlanner} from "./TimePlanner";
import {useQuery} from "react-query";

const formats = {
    lastDay: "[Yesterday] DD.MM",
    sameDay: "[Today] DD.MM",
    nextDay: "[Tomorrow] DD.MM",
    lastWeek: "[Last] dddd DD.MM",
    nextWeek: "[Next] dddd DD.MM",
    sameElse: "L",
};

export const Day = memo(({day = moment(), tasks, settings}) => {
    
    const {data: allTasksForADay, isLoading} = useQuery([
        "tasks",
        {
            method: "withinInterval",
            from: day.clone().startOf("day").toDate(),
            to: day.clone().endOf("day").toDate(),
            responsible: settings.responsible,
        },
    ]);
    return (
        <TimePlanner
            active={allTasksForADay}
            all={tasks}
            loading={isLoading}
            period={day.calendar(null, formats)}
            day={day}
            droppable={true}
        />
    );
});
