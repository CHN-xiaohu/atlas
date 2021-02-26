import {memo} from "react";
import {Avatar, Calendar, Col, ConfigProvider, Divider, Row, Space, Tooltip, Typography} from "antd";
import Moment from "moment";
import {extendMoment} from "moment-range";
import {color, rateClient} from "../Helper";
import {Spinner} from "./common/Spinner";
import styled from "styled-components";
import {Redirect, Route, Switch, useRouteMatch} from "react-router-dom";
import {MonthSchedule as ManagersStats} from "./schedule/MonthSchedule";
import {Managers} from "./schedule/Managers";
import {ModuleMenu} from "./schedule/ModuleMenu";
import {MonthMenu} from "./leads/purchases/MonthMenu";
import {Flex} from "../styled/flex";
import {ScheduleForADay} from "./schedule/DaySchedule";
import {Event} from "./schedule/Event";
import {MenuHeader} from "./common/MenuHeader";
import {Stars} from "./common/Stars";
import {useQuery} from "react-query";
import i18next from "i18next";
import {localeMap} from "../App";
import {getHoliday} from "china-holidays";

const {Text} = Typography;
const moment = extendMoment(Moment);
const Guide = styled.div`
    text-align: center;
    display: flex;
    flex-direction: column;
    margin-top: 3px;
    span.ant-badge {
        margin-bottom: 3px;
        .ant-badge-count {
            line-height: 16px;
            height: auto;
        }
    }
`;

const SchedulePanel = styled(Row).attrs({
    type: "flex",
    gutter: {xs: 16, sm: 16, lg: 24, xl: 48, xxl: 48},
})`
    .ant-picker-cell:not(.ant-picker-cell-in-view) {
        opacity: 0.65;
    }

    .ant-picker-cell:not(.ant-picker-cell-selected) {
        .holiday {
            background-color: #fffafa;
        }
        .replacement {
            background-color: #fbfff6;
        }
    }
`;

export const getEventsForTheDay = (managers, day) => {
    return managers
        .map(manager =>
            (manager.records ?? [])
                .filter(record => {
                    if (record.online !== true) {
                        const from = moment(record.arrivalDate);
                        const to = moment(record.departureDate);
                        const event = moment.range(from, to);
                        return event.overlaps(day.range("day"), {adjacent: true});
                    } else {
                        return moment(record.orderDate).isSame(day, "day");
                    }
                })
                .map(record => {
                    return {
                        ...record,
                        manager,
                    };
                }),
        )
        .flat()
        .sort((a, b) => {
            return moment(a.arrivalDate).unix() - moment(b.arrivalDate).unix();
        });
};

export const getPeriodsForTheDay = (managers, day) => {
    return managers
        .map(manager =>
            (manager.periods ?? [])
                .filter(period => {
                    const from = moment(period.start);
                    const to = moment(period.end);
                    const event = moment.range(from, to);
                    return event.overlaps(day.range("day"));
                })
                .map(period => {
                    return {
                        ...period,
                        manager,
                    };
                }),
        )
        .flat();
};

export const getRating = lead => {
    const rating = rateClient(lead);
    return <Stars count={rating} />;
};

const dateCellRender = (managers, day) => {
    const events = getEventsForTheDay(managers, day);
    return (
        <Guide>
            {events.map(event => (
                <Event key={event.id} managers={managers} event={event} day={day} />
            ))}
        </Guide>
    );
};

const CrossedAvatar = styled(Avatar).attrs({
    size: 15,
})`
    display: inline-block;
    position: relative;
    overflow: hidden;
    :before {
        content: "";
        position: absolute;
        display: block;
        width: auto;
        height: auto;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0) url("/cross.svg") no-repeat;
        background-size: 100% 100%;
    }
    margin-right: 2px !important;
`;

const ValueContainer = styled.div`
    display: flex !important;
    justify-content: space-between;
    align-items: center;
`;

const DateContainer = styled(Text).attrs({
    ellipsis: true,
})`
    color: ${props => props.color} !important;
`;

const dateFullCellRender = (managers, day) => {
    const holiday = getHoliday(day.toDate());
    // eslint-disable-next-line immutable/no-let
    let c = "inherit";
    if (holiday == null) {
        if ([6, 0].includes(moment(day).day())) {
            c = color("red");
        }
    } else if (holiday.type === "holiday") {
        c = color("red");
    }

    const isHoliday = holiday != null && holiday.type === "holiday";
    const cHoliday = isHoliday ? "holiday" : "";
    const cReplacement = holiday != null && holiday.type === "workingday" ? "replacement" : "";
    const todayPeriods = getPeriodsForTheDay(managers, day);
    return (
        <div className={`ant-picker-cell-inner ant-picker-calendar-date ${cHoliday} ${cReplacement}`}>
            <ValueContainer className="ant-picker-calendar-date-value">
                <Text ellipsis>
                    {todayPeriods.map(check => (
                        <Tooltip key={check._id} title={`${check.manager.manager} — ${check.note}`}>
                            <CrossedAvatar src={check.manager.avatar} size={15} shape="square">
                                {check.manager.manager}
                            </CrossedAvatar>
                        </Tooltip>
                    ))}
                </Text>
                <DateContainer color={c}>
                    <Space>
                        <span>{holiday != null ? (isHoliday ? holiday.name : "work") : null}</span>
                        <span>{moment(day).format("D")}</span>
                    </Space>
                </DateContainer>
            </ValueContainer>
            <div className="ant-picker-calendar-date-content">{dateCellRender(managers, day)}</div>
        </div>
    );
};

export const Schedule = memo(() => {
    const match = useRouteMatch(`/schedule/:year/:month/:day?/:mode?`);
    const params = match?.params;
    const now = moment();
    const year = params?.year ?? now.year();
    const month = params?.month ?? now.month();
    const day = params?.day ?? now.day();
    const date = moment({year, month: month - 1, day});
    const mode = params?.mode;
    const {data: managers, isPlaceholderData} = useQuery(
        [
            "users",
            {
                method: "managers",
            },
        ],
        {
            placeholderData: [],
            staleTime: 4 * 60 * 60 * 1000,
            cacheTime: 4 * 60 * 60 * 1000,
        },
    );

    const {data: leads, isSuccess} = useQuery(
        [
            "leads",
            {
                method: "scheduledLeads",
                managers: managers.map(m => m.login),
                from: date.clone().startOf("month").subtract(15, "days").toDate(),
                to: date.clone().endOf("month").add(15, "days").toDate(),
            },
        ],
        {
            placeholderData: [],
            enabled: Array.isArray(managers) && managers.length > 0,
        },
    );

    const {data: periods} = useQuery(
        [
            "periods",
            {
                method: "get",
                managers: managers.map(m => m.manager),
                from: date.clone().startOf("month").subtract(15, "days").toDate(),
                to: date.clone().endOf("month").add(15, "days").toDate(),
            },
        ],
        {
            placeholderData: [],
            enabled: Array.isArray(managers) && managers.length > 0,
        },
    );

    if (!isSuccess) {
        return <Spinner />;
    }

    const data = managers.concat([{manager: null}]).map(manager => ({
        ...manager,
        records: leads.filter(lead => {
            return (
                (!Array.isArray(lead.managers) ||
                    lead.managers.length === 0 ||
                    lead.managers.includes(manager.manager)) &&
                [23674579, 20674288, 21411409, 22115713, 20674273, 22115713, 31331350, 142].includes(lead.status_id) &&
                lead.online !== true &&
                lead.arrivalDate != null &&
                lead.departureDate != null
            );
        }),
        periods: periods.filter(check => {
            return check.manager === manager.manager;
        }),
    }));
    const renderCell = day => dateFullCellRender(data ?? [], day);
    const SidePanel = (() => {
        if (mode === "day") {
            return ScheduleForADay;
        } else if (mode === "month") {
            return ManagersStats;
        } else if (mode === "managers") {
            return Managers;
        }
    })();
    return (
        <SchedulePanel>
            <Col xs={24} sm={24} md={24} lg={24} xl={16}>
                <Switch>
                    <Route
                        path="/schedule/:year(\d+)/:month(\d+)/:day(\d+)/:mode?"
                        render={({history}) => {
                            if (date.isValid()) {
                                return isPlaceholderData ? (
                                    <Spinner />
                                ) : (
                                    <>
                                        <MenuHeader extra={[<MonthMenu module="schedule" />]} />
                                        <ConfigProvider locale={localeMap[i18next.language]}>
                                            <Calendar
                                                headerRender={() => null}
                                                fullscreen
                                                dateFullCellRender={renderCell}
                                                value={date}
                                                onSelect={date => {
                                                    history.push(`/schedule/${date.format("YYYY/M/D")}/${mode}`);
                                                }}
                                                loading={isPlaceholderData}
                                            />
                                        </ConfigProvider>
                                    </>
                                );
                            }
                        }}
                    />
                    <Redirect push to={`/schedule/${moment().format("YYYY/M/D")}`} />
                </Switch>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={8}>
                <Switch>
                    <Route
                        path="/schedule/:year(\d+)/:month(\d+)/:day(\d+)/:mode"
                        render={() => (
                            <>
                                <Flex justifyBetween>
                                    <div />
                                    <ModuleMenu />
                                </Flex>
                                <Divider />
                                <SidePanel day={date} managers={managers ?? []} />
                            </>
                        )}
                    />
                    <Redirect
                        path="/schedule/:year(\d+)/:month(\d+)/:day(\d+)"
                        to={`/schedule/${date.format("YYYY/M/D")}/day`}
                    />
                </Switch>
            </Col>
        </SchedulePanel>
    );
});
