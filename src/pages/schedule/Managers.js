import {getImageLink, isWorkingDay} from "../../Helper";
import {Avatar, Descriptions, List, Statistic} from "antd";
import {memo} from "react";
import moment from "moment";
import {useTranslation} from "react-i18next";

export const Managers = memo(({managers, day}) => {
    const month = moment.range(moment(day).startOf("month"), moment(day).endOf("month")).by("day");
    const days = Array.from(month);
    const workingDays = days.filter(day => isWorkingDay(day, true)).length;
    const {t} = useTranslation();
    return (
        <>
            <Descriptions column={1}>
                <Descriptions.Item label={t("schedule.totalDaysInAMonth")}>{day.daysInMonth()}</Descriptions.Item>
                <Descriptions.Item label={t("schedule.workingDaysPerMonth")}>{workingDays}</Descriptions.Item>
            </Descriptions>
            <List
                itemLayout="horizontal"
                dataSource={managers.filter(manager => manager.manager && manager.active && !manager.banned)}
                renderItem={manager => {
                    const workDuringWeekends = [
                        ...new Set(
                            manager.records
                                .concat(manager.periods.filter(check => check.workingDays === true))
                                .map(event => {
                                    const inFoshan = moment.range(
                                        moment(event.arrivalDate || event.start).startOf("day"),
                                        moment(event.departureDate || event.end).endOf("day"),
                                    );
                                    const intersection = inFoshan.intersect(day.range("month"));
                                    if (intersection != null) {
                                        const days = Array.from(intersection.by("day"));
                                        const workingWeekends = days.filter(day => !isWorkingDay(day, true));
                                        return workingWeekends.map(day => day.date());
                                    }
                                    return [];
                                })
                                .flat(),
                        ),
                    ].length;
                    const restDuringWorkingDays = [
                        ...new Set(
                            manager.periods
                                .filter(check => check.workingDays !== true)
                                .map(check => {
                                    const inFoshan = moment.range(
                                        moment(check.start).startOf("day"),
                                        moment(check.end).endOf("day"),
                                    );
                                    const intersection = inFoshan.intersect(day.range("month"));
                                    if (intersection != null) {
                                        const days = Array.from(intersection.by("day"));
                                        const restedDays = days.filter(day => isWorkingDay(day, true));
                                        return restedDays.map(day => day.date());
                                    }
                                    return [];
                                })
                                .flat(),
                        ),
                    ].length;
                    const requiresCompensation = workDuringWeekends - restDuringWorkingDays;
                    return (
                        <List.Item
                            extra={<Statistic value={workingDays + requiresCompensation} suffix={`/ ${workingDays}`} />}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        src={
                                            getImageLink(manager?.avatar, "avatar_webp", manager?.session) ||
                                            "/files/avatars/default.webp"
                                        }
                                        style={{
                                            width: "44px",
                                            height: "44px",
                                        }}
                                        shape="square"
                                        size="large"
                                    >
                                        ?
                                    </Avatar>
                                }
                                title={manager.name || manager.manager}
                                description={
                                    <span>
                                        {t("schedule.processing")} ({workDuringWeekends} {t("schedule.days")}) -
                                        {t("schedule.compensated")} ({restDuringWorkingDays} {t("schedule.days")}) =
                                        {requiresCompensation > 0 ? `+${requiresCompensation}` : requiresCompensation}
                                        {t("schedule.days")}
                                    </span>
                                }
                            />
                        </List.Item>
                    );
                }}
            />
        </>
    );
});
