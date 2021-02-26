import { memo, useState } from "react";
import {Button, Col, ConfigProvider, DatePicker, Space} from "antd";
import moment from "moment";
import {nextWorkingDay} from "../../../Helper";
import zhCN from "antd/es/locale/zh_CN";
import {KPI} from "./sales/KPI";
import {KPIChart} from "./sales/KPIChart";
import {ManagersMenu} from "../../common/ManagersMenu";
import {useTranslation} from "react-i18next";
const {RangePicker} = DatePicker;

export const SalesManager = memo(() => {
    const [date, setDate] = useState(moment());
    const [week, setWeek] = useState(moment());
    const [month, setMonth] = useState(moment());
    const [dates, setDates] = useState([moment().subtract(7, "day"), moment()]);
    const [from, to] = dates;
    const [responsible, setResponsible] = useState();
    const {t} = useTranslation();
    return (
        <ConfigProvider locale={zhCN}>
            <Col span={24}>
                <Space>
                    <Button onClick={() => setDates([moment().add(-1, "month").startOf("day"), moment().endOf("day")])}>
                        {t("statistics.lastMonth")}
                    </Button>
                    <Button onClick={() => setDates([moment().add(-1, "week").startOf("day"), moment().endOf("day")])}>
                        {t("statistics.lastWeek")}
                    </Button>
                    <RangePicker value={dates} onChange={dates => setDates(dates)} />
                </Space>
                <KPIChart from={from} to={to} />
            </Col>
            <Col span={24}>
                <div>
                    <Space>
                        <DatePicker value={date} onChange={date => setDate(date)} />
                        <ManagersMenu
                            value={responsible ?? null}
                            onClick={responsible => setResponsible(responsible)}
                        />
                    </Space>
                </div>
                <KPI
                    title={t("statistics.dailyKPI")}
                    from={date.clone().startOf("day")}
                    to={date.clone().endOf("day")}
                    compareFrom={nextWorkingDay(date, true).startOf("day")}
                    compareTo={nextWorkingDay(date, true).endOf("day")}
                    user={responsible}
                />
                <div>
                    <DatePicker picker="week" value={week} onChange={week => setWeek(week)} />
                </div>
                <KPI
                    title={t("statistics.weeklyKPI")}
                    from={week.clone().startOf("week")}
                    to={week.clone().endOf("week")}
                    compareFrom={week.clone().subtract(1, "week").startOf("week")}
                    compareTo={week.clone().subtract(1, "week").endOf("week")}
                    user={responsible}
                />
                <div>
                    <DatePicker picker="month" value={month} onChange={month => setMonth(month)} />
                </div>
                <KPI
                    title={t("statistics.monthlyKPI")}
                    from={month.clone().startOf("month")}
                    to={month.clone().endOf("month")}
                    compareFrom={month.clone().subtract(1, "month").startOf("month")}
                    compareTo={month.clone().subtract(1, "month").endOf("month")}
                    user={responsible}
                />
            </Col>
        </ConfigProvider>
    );
});
