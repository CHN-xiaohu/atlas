import {clientColor, color, getImageLink, leadName, Link} from "../../Helper";
import {CloudOutlined, PlusOutlined} from "@ant-design/icons";
import {
    Avatar,
    Button,
    Divider,
    List,
    Select,
    Statistic,
    Typography,
    DatePicker,
    Checkbox,
    Form,
    Input,
    Space,
} from "antd";
import {memo, useState} from "react";
import {getEventsForTheDay, getPeriodsForTheDay} from "../Schedule";
import moment from "moment";
import {useHistory} from "react-router-dom";
import {FlagMaker} from "../common/EditableFields";
import {getCountryCode} from "../../data/countries";
import {useRequest} from "../../hooks/useRequest";
import {useTranslation} from "react-i18next";
import {LimitedView} from "../common/LimitedView";
const {Title} = Typography;
const {RangePicker} = DatePicker;
const {Option} = Select;
const {TextArea} = Input;

const UnavailabilityForm = memo(
    ({
        start: s = null,
        end: e = null,
        note: n = "",
        manager: m = "",
        workingDays: w = true,
        onSubmit,
        onCancel,
        managers,
    }) => {
        const [manager, setManager] = useState(m.manager);
        const [note, setNote] = useState(n);
        const [start, setStart] = useState(s);
        const [end, setEnd] = useState(e);
        const [workingDays, setWorkingDays] = useState(w);
        const disabled = manager == null || note.length === 0 || start == null || end == null;
        const {t} = useTranslation();
        return (
            <Form layout="vertical">
                <Form.Item label={t("schedule.manager")}>
                    <Select
                        placeholder={t("schedule.chooseTheManager")}
                        onChange={manager => setManager(manager)}
                        value={manager}
                    >
                        {managers
                            .filter(m => m.active)
                            .map(m => (
                                <Option key={m.manager} value={m.manager}>
                                    {m.manager}
                                </Option>
                            ))}
                    </Select>
                </Form.Item>
                <Form.Item label={t("schedule.dates")}>
                    <RangePicker
                        value={[start, end]}
                        style={{width: "100%"}}
                        onChange={e => {
                            setStart(e[0]);
                            setEnd(e[1]);
                        }}
                    />
                </Form.Item>
                <Form.Item>
                    <Checkbox checked={workingDays} onChange={({target}) => setWorkingDays(target.checked)}>
                        {t("schedule.workingDays")}
                    </Checkbox>
                </Form.Item>
                <Form.Item label={t("schedule.note")}>
                    <TextArea value={note} onChange={({target}) => setNote(target.value)} />
                </Form.Item>
                <div style={{display: "flex", justifyContent: "space-between", marginTop: "1rem"}}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        disabled={disabled}
                        onClick={() =>
                            onSubmit({
                                manager,
                                note,
                                start: start.toDate(),
                                end: end.toDate(),
                                workingDays,
                            })
                        }
                    >
                        {t("schedule.submit")}
                    </Button>
                    <Button type="danger" onClick={onCancel}>
                        {t("schedule.cancel")}
                    </Button>
                </div>
            </Form>
        );
    },
);

const UnavailabilityPanel = memo(({managers, day}) => {
    const [editing, setEditing] = useState(false);
    const [adding, setAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const deleteUnavailabilityPeriod = useRequest("/periods/delete");
    const addUnavailabilityPeriod = useRequest("/periods/add");
    const editUnavailabilityPeriod = useRequest("/periods/edit");
    const periods = getPeriodsForTheDay(managers, day).filter(period => period.online !== true);
    const {t} = useTranslation();
    return (
        <>
            {periods.length !== 0 ? (
                <>
                    <Title level={4}>{t("schedule.unavailability")}</Title>
                    <List
                        itemLayout="horizontal"
                        dataSource={periods}
                        renderItem={check => {
                            return (
                                <List.Item
                                    actions={[
                                        <Button
                                            loading={loading && editing}
                                            disabled={loading}
                                            onClick={() => {
                                                setLoading(false);
                                                setAdding(false);
                                                setEditing({
                                                    ...check,
                                                    start: moment(check.start),
                                                    end: moment(check.end),
                                                    workingDays: check.workingDays || false,
                                                });
                                            }}
                                        >
                                            {t("schedule.edit")}
                                        </Button>,
                                        <Button
                                            type="danger"
                                            onClick={async () => {
                                                setLoading(true);
                                                await deleteUnavailabilityPeriod({_id: check._id});
                                                setLoading(false);
                                            }}
                                        >
                                            {t("schedule.delete")}
                                        </Button>,
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                src={
                                                    getImageLink(
                                                        check.manager?.avatar,
                                                        "avatar_webp",
                                                        check.manager?.session,
                                                    ) || "/files/avatars/default.webp"
                                                }
                                                style={{
                                                    backgroundColor: "inherit",
                                                    border: `2px solid ${color(check.manager.color)}`,
                                                    color: color(check.manager.color),
                                                    width: "44px",
                                                    height: "44px",
                                                }}
                                                shape="square"
                                                size="large"
                                            >
                                                {check.manager.manager}
                                            </Avatar>
                                        }
                                        title={
                                            <span
                                                style={{
                                                    color: color(check.manager.color),
                                                }}
                                            >
                                                {check.manager.manager}
                                            </span>
                                        }
                                        description={check.note || "Unavailable"}
                                    />
                                </List.Item>
                            );
                        }}
                    />
                    <Divider />
                </>
            ) : null}
            <div style={{textAlign: "center"}}>
                {!adding && !editing && (
                    <LimitedView groups={[(g, user) => user?.access?.schedule?.canAddperiod]}>
                        <Button
                            loading={loading && adding}
                            disabled={loading}
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setAdding(true);
                                setLoading(false);
                                setEditing(false);
                            }}
                        >
                            {t("schedule.addUnavailabilityPeriod")}
                        </Button>
                    </LimitedView>
                )}
            </div>
            {adding && (
                <UnavailabilityForm
                    managers={managers}
                    onSubmit={async data => {
                        setLoading(true);
                        await addUnavailabilityPeriod(data);
                        setLoading(false);
                        setAdding(false);
                    }}
                    onCancel={() => setAdding(false)}
                />
            )}
            {editing && (
                <UnavailabilityForm
                    managers={managers}
                    onSubmit={async data => {
                        setLoading(true);
                        await editUnavailabilityPeriod({...data, _id: editing._id});
                        setLoading(false);
                        setEditing(false);
                    }}
                    onCancel={() => setEditing(false)}
                    {...editing}
                />
            )}
        </>
    );
});

const DayStats = memo(({event, day}) => {
    const arrival = moment(event.arrivalDate).startOf("day");
    const departure = moment(event.departureDate).endOf("day");
    const dayNumber = Math.round(day.endOf("day").diff(arrival, "days", true));
    const daysInTotal = Math.round(departure.diff(arrival, "days", true));
    return <Statistic title="Day" value={dayNumber} suffix={`/ ${daysInTotal}`} />;
});

export const ScheduleForADay = memo(({day, managers}) => {
    const history = useHistory();
    const activeEvents = getEventsForTheDay(managers, day);
    const {t} = useTranslation();
    return (
        <>
            {activeEvents.length !== 0 ? (
                <>
                    <Title level={4}>{t("schedule.translationClients")}</Title>
                    <List
                        itemLayout="horizontal"
                        dataSource={activeEvents}
                        renderItem={event => {
                            const confirmed = [142, 22115713, 20674288].includes(event.status_id);

                            return (
                                <List.Item
                                    extra={event.online ? <CloudOutlined /> : <DayStats event={event} day={day} />}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                src={
                                                    getImageLink(
                                                        event.manager?.avatar,
                                                        "avatar_webp",
                                                        event.manager?.session,
                                                    ) || "/files/avatars/default.webp"
                                                }
                                                style={{
                                                    backgroundColor: confirmed ? color : "inherit",
                                                    border: `2px solid ${color(event.manager.color || "grey")}`,
                                                    color: confirmed ? "white" : color(event.manager.color),
                                                    width: "44px",
                                                    height: "44px",
                                                }}
                                                shape="square"
                                                size="large"
                                            >
                                                ?
                                            </Avatar>
                                        }
                                        title={
                                            <Space>
                                                {event.country && <FlagMaker country={getCountryCode(event.country)} />}
                                                <Link
                                                    style={{
                                                        color: clientColor(event),
                                                    }}
                                                    onClick={() => {
                                                        history.push(`/leads/${event._id}`);
                                                    }}
                                                >
                                                    {leadName(event)}
                                                </Link>
                                            </Space>
                                        }
                                        description={
                                            <>
                                                {event.propertyType} {event.propertySize ?? "?"} м<sup>2</sup>
                                            </>
                                        }
                                    />
                                </List.Item>
                            );
                        }}
                    />
                </>
            ) : null}
            <UnavailabilityPanel day={day} managers={managers} />
        </>
    );
});
