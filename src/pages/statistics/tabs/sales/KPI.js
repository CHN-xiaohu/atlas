import { memo } from "react";
import moment from "moment";
import {color, nextWorkingDay, smooth} from "../../../../Helper";
import {Space, Statistic, Tag, Tooltip} from "antd";
import {FallOutlined, LoadingOutlined, MinusOutlined, RiseOutlined} from "@ant-design/icons";
import styled from "styled-components";
import {useToggle} from "../../../../hooks/useToggle";
import {useQuery} from "react-query";
import {useTranslation} from "react-i18next";

const unsure = "🤔";
const emojiMap = [
    {level: 100, label: "😍", tooltip: "statistics.perfect"},
    {level: 90, label: "😃", tooltip: "statistics.impressive"},
    {level: 80, label: "😊", tooltip: "statistics.high"},
    {level: 70, label: "🙂", tooltip: "statistics.moderate"},
    {level: 60, label: "🤨"},
    {level: 50, label: "😐"},
    {level: 40, label: "😒"},
    {level: 30, label: "🤯", tooltip: "statistics.low"},
    {level: 20, label: "🥺"},
    {level: 10, label: "😥"},
    {level: 0, label: "😰"},
];

const Emoji = styled.span.attrs({
    role: "img",
})`
    font-size: 1.5em;
    color: black;
    opacity: 1;
`;

const Score = memo(({percent}) => {
    const {t} = useTranslation();
    const score = emojiMap.find(score => percent >= score.level);
    if (isNaN(percent)) {
        return <Tag>{t("statistics.unknown")}</Tag>;
    }
    return t(score.tooltip) ? (
        <Tooltip title={t(score.tooltip)}>
            <Emoji>{score.label}</Emoji>
        </Tooltip>
    ) : (
        <Emoji>{score.label}</Emoji>
    );
});

const pkMap = {
    high: 3,
    middle: 2,
    low: 1,
};

export const kpi = (tasks, absolute = false, pendingAsCompleted = true) => {
    const scores = tasks.reduce((bank, task) => {
        if (!task.status && !pendingAsCompleted) {
            return bank;
        }
        const priority = task.priority ?? "middle";
        const bonus = task.bonus ?? 0;
        const pk = pkMap[priority];
        const delay = moment(task.status ? task.updated_at : moment()).diff(task.complete_till, "hour", true);
        //console.log(delay);
        if (delay <= 1) return bank + 6 * (pk + bonus);
        if (delay <= 2) return bank + 4 * (pk + bonus);
        if (delay <= 4) return bank + 3 * (pk + bonus);
        if (delay <= 24) return bank + 2 * (pk + bonus);
        return bank + pk + bonus;
    }, 0);
    if (absolute) return scores;
    const max = tasks.reduce((bank, task) => {
        const priority = task.priority ?? "middle";
        const pk = pkMap[priority];
        const bonus = task.bonus ?? 0;
        return bank + (pk + bonus) * 6;
    }, 0);
    return (scores / max) * 100;
};

const ArrowUp = styled(RiseOutlined)`
    color: ${color("green")};
`;

const ArrowDown = styled(FallOutlined)`
    color: ${color("red")};
`;

const Even = styled(MinusOutlined)`
    color: ${color("blue")};
`;

export const KPI = memo(({
    from = moment().startOf("day"),
    to = moment().endOf("day"),
    compareFrom = nextWorkingDay(moment(), true).startOf("day"),
    compareTo = nextWorkingDay(moment(), true).endOf("day"),
    title = "KPI",
    user,
}) => {
    const {t} = useTranslation();
    const {data: tasks, isPlaceholderData} = useQuery(
        [
            "tasks",
            {
                method: "withinInterval",
                from: from.toDate(),
                to: to.toDate(),
                responsible: user,
            },
        ],
        {
            placeholderData: [],
        },
    );
    const {data: previousTasksRaw, isPlaceholderData: isPreviousTasksLoading} = useQuery(
        [
            "tasks",
            {
                method: "withinInterval",
                from: compareFrom.toDate(),
                to: compareTo.toDate(),
                responsible: user,
            },
        ],
        {
            placeholderData: [],
        },
    );

    const [floating, toggleFloating] = useToggle(true); // floating or accumulative index
    if (isPlaceholderData || isPreviousTasksLoading)
        return (
            <Space>
                {title}
                <Statistic prefix={<LoadingOutlined spin />} value=" " />
            </Space>
        );
    const todayTasks = tasks.filter(task => user == null || task.responsible == null || task.responsible === user);
    const previousTasks = previousTasksRaw.filter(
        task => user == null || task.responsible == null || task.responsible === user,
    );
    const index = kpi(todayTasks, false, floating);
    const previousIndex = kpi(previousTasks);
    return (
        <Space>
            {title}
            <Statistic
                prefix={
                    !isNaN(index) &&
                    !isNaN(previousIndex) && (
                        <Tooltip
                            title={
                                <>
                                    {t("statistics.previousValue")}: {smooth(previousIndex, 1)} (
                                    {compareFrom?.calendar(null, {
                                        lastDay: "[Yesterday]",
                                        sameDay: "[Today]",
                                        lastWeek: "[Last] dddd",
                                        sameElse: "L",
                                    })}
                                    )
                                </>
                            }
                        >
                            <div onDoubleClick={() => toggleFloating()}>
                                {Math.round(previousIndex) === Math.round(index) ? (
                                    <Even />
                                ) : previousIndex < index ? (
                                    <ArrowUp />
                                ) : (
                                    <ArrowDown />
                                )}
                            </div>
                        </Tooltip>
                    )
                }
                value={isNaN(index) ? "?" : smooth(index, 1)}
            />
            <sup>
                <Tooltip title={t("statistics.completed")}>
                    <span style={{color: color("green")}}>{todayTasks.filter(t => t.status).length}</span>
                </Tooltip>
                /
                <Tooltip title={t("statistics.overdue")}>
                    <span style={{color: color("red")}}>
                        {
                            todayTasks.filter(task => !task.status && moment(task.complete_till).isBefore(moment()))
                                .length
                        }
                    </span>
                </Tooltip>
                /
                <Tooltip title={t("statistics.total")}>
                    <span style={{color: color("blue")}}>{todayTasks.length}</span>
                </Tooltip>
            </sup>
            {!isNaN(index) ? <Score percent={index} /> : <Emoji>{unsure}</Emoji>}
        </Space>
    );
});
