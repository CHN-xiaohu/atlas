import moment from "moment";
import {Spinner} from "../../../common/Spinner";
import {kpi} from "./KPI";
import {Line} from "@ant-design/charts";
import { memo } from "react";
import {useQuery} from "react-query";
import {useTranslation} from "react-i18next";

export const KPIChart = memo(({from, to}) => {
    const {t} = useTranslation();
    const {data: tasks, isLoading} = useQuery([
        "tasks",
        {
            method: "withinInterval",
            from: moment(from).startOf("day").toISOString(),
            to: moment(to).endOf("day").toISOString(),
        },
    ]);

    if (isLoading || !Array.isArray(tasks)) {
        return <Spinner />;
    }
    const interval = moment.range(from, to);
    const days = Array.from(interval.by("day"));
    //const mean = kpi(tasks);
    const data = days
        .map(day => {
            const thisDayTasks = tasks.filter(task => moment(task.complete_till).isSame(day, "day"));
            return [
                {
                    date: day.format("D MMMM"),
                    value: Math.round(kpi(thisDayTasks)),
                    manager: "Total",
                },
                {
                    date: day.format("D MMMM"),
                    value: Math.round(kpi(thisDayTasks.filter(task => task.responsible === "alena"))),
                    manager: "Alena",
                },
                {
                    date: day.format("D MMMM"),
                    value: Math.round(kpi(thisDayTasks.filter(task => task.responsible === "maria"))),
                    manager: "Maria",
                },
            ];
        })
        .flat();

    const props = {
        title: {
            visible: true,
            text: t("statistics.kpi"),
        },
        description: {
            visible: true,
            text: `${t("statistics.KPIComparisionChartForGlobusSalesManagers")}.`,
        },
        padding: "auto",
        forceFit: true,
        data,
        smooth: true,
        xField: "date",
        yField: "value",
        legend: {
            position: "right-top",
        },
        seriesField: "manager",
        //responsive: true,
    };
    return <Line {...props} />;
});
