import {memo, useState} from "react";
import {CheckOutlined, ClockCircleOutlined, DeleteOutlined} from "@ant-design/icons";
import {
    Affix,
    Button,
    Card,
    DatePicker,
    Divider,
    Input,
    Popover,
    Statistic,
    Typography,
    Popconfirm,
    Form,
    Space,
} from "antd";
import moment from "moment";
import styled from "styled-components";
import {color} from "../../../Helper";
import {Flex} from "../../../styled/flex";
import {ResponsibleManagerBadge} from "../../common/ResponsibleManagerBadge";
import {useTranslation} from "react-i18next";
import {useDataMutation} from "../../../hooks/useDataMutation";
import {useQuery, useQueryClient} from "react-query";
import {LimitedView} from "../../common/LimitedView";
import {useGlobalState} from "../../../hooks/useGlobalState";
const {TextArea} = Input;
const {Meta} = Card;
const {Countdown} = Statistic;
const {Text} = Typography;

const Container = styled.div`
    background-color: white;
    margin-bottom: 1rem;
`;

const red = color("red");
const green = color("green");

const SuccessButton = styled(Button).attrs({
    type: "ghost",
    icon: <CheckOutlined />,
})`
    :hover,
    :focus {
        color: ${green} !important;
        border-color: ${green} !important;
    }
`;

const FailureButton = styled(Button).attrs({
    type: "ghost",
    icon: <ClockCircleOutlined />,
})`
    :hover,
    :focus {
        color: ${red} !important;
        border-color: ${red} !important;
    }
`;

const TaskContainer = styled(Card).attrs({
    size: "small",
    hoverable: true,
})`
    background-color: ${props => props.color} !important;
    ${props =>
        props.affixed &&
        `
        border-color: rgba(0,0,0,.09);
        box-shadow: 0 2px 8px rgba(0,0,0,.09);
    `}
    .ant-card-meta-description {
        color: rgba(0, 0, 0, 0.65);
    }
`;

const ActiveTasksContainer = styled.div`
    margin-bottom: 1rem;
`;

export const StyledCountdown = styled(Countdown)`
    .ant-statistic-content {
        font-size: inherit;
        color: inherit;
    }
`;

const StyledTextArea = styled(TextArea)`
    width: 30vw !important;
`;

const Item = styled(Form.Item)`
    margin-bottom: 0.8rem !important;
`;

export const FinishTask = memo(({_id, hide, lead, quickDiscard = true}) => {
    const [result, setResult] = useState("");
    const queryClient = useQueryClient();
    const {mutate: completeTask} = useDataMutation("/tasks/complete", {
        onSuccess: () => {
            queryClient.invalidateQueries("tasks");
        },
    });
    const {mutate: changeLeadInfo} = useDataMutation("/leads/change", {
        onSuccess: () => {
            queryClient.invalidateQueries("tasks");
        },
    });
    const {t} = useTranslation();
    return (
        <Form>
            <Item>
                <StyledTextArea onChange={({target}) => setResult(target.value)} value={result} />
            </Item>
            <Flex justifyEnd>
                <Button
                    disabled={result.length < 20}
                    icon={<CheckOutlined />}
                    type="primary"
                    onClick={() => {
                        completeTask({_id, result});
                        typeof hide === "function" && hide();
                    }}
                >
                    {t("leads.complete")}
                </Button>
                {quickDiscard && (
                    <>
                        <Divider type="vertical" />
                        <Popconfirm
                            placement="bottom"
                            title={`${t("leads.areYouSure")}?`}
                            onConfirm={() => {
                                completeTask({_id, result});
                                hide();
                                changeLeadInfo({lead: lead._id, key: "status_id", value: 143});
                            }}
                            okText={t("leads.yes")}
                            cancelText={t("leads.No")}
                        >
                            <Button danger icon={<DeleteOutlined />}>
                                {t("leads.closeAndDiscard")}
                            </Button>
                        </Popconfirm>
                    </>
                )}
            </Flex>
        </Form>
    );
});

const PostponeTask = memo(({_id, hide, defaultTime, lead}) => {
    const [reason, setReason] = useState("");
    const queryClient = useQueryClient();
    const {mutate: changeTime} = useDataMutation("/tasks/reschedule", {
        onSuccess: () => {
            queryClient.invalidateQueries("tasks");
        },
    });
    const {mutate: addNote} = useDataMutation("/notes/addText", {
        onSuccess: () => {
            queryClient.invalidateQueries("notes");
        },
    });
    const [time, setTime] = useState(defaultTime);
    const {t} = useTranslation();
    return (
        <Form>
            <Item>
                <StyledTextArea onChange={({target}) => setReason(target.value)} value={reason} />
            </Item>
            <Item>
                <Button.Group>
                    <Button onClick={() => setTime(moment().set({hours: 19, minutes: 0}))}>{t("leads.tonight")}</Button>
                    <Button onClick={() => setTime(moment().set({hours: 19, minutes: 0}).add(1, "day"))}>
                        {t("leads.tomorrow")}
                    </Button>
                    <Button
                        onClick={() => setTime(moment().startOf("isoWeek").add(1, "week").set({hours: 19, minutes: 0}))}
                    >
                        {t("leads.nextWeek")}
                    </Button>
                    <DatePicker
                        value={time}
                        onChange={setTime}
                        allowClear={false}
                        format="YYYY-MM-D HH:mm"
                        showTime={{minuteStep: 5, format: "HH:mm"}}
                    />
                </Button.Group>
            </Item>
            <Flex justifyEnd>
                <Button
                    disabled={reason.length < 20 || time == null}
                    icon={<ClockCircleOutlined />}
                    type="primary"
                    onClick={() => {
                        addNote({
                            lead,
                            text: `${t("leads.taskHasBeenRescheduledTo")} ${time.format(
                                "DD MMMM YYYY HH:mm",
                            )}\nReason: ${reason}`,
                        });
                        changeTime({_id, time: time.toDate()});
                        hide();
                    }}
                >
                    {t("leads.postpone")}
                </Button>
            </Flex>
        </Form>
    );
});

export const ChangeTime = memo(({_id, defaultTime, hide, limit}) => {
    const [time, setTime] = useState(defaultTime);
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const {mutate: changeTime} = useDataMutation("/tasks/reschedule", {
        onSuccess: () => {
            queryClient.invalidateQueries("tasks");
        },
    });
    return (
        <>
            <DatePicker
                value={time}
                onChange={setTime}
                allowClear={false}
                format="YYYY-MM-D HH:mm"
                showTime={{minuteStep: 5, format: "HH:mm"}}
                disabledDate={limit}
            />
            <Divider type="vertical" />
            <Button
                type="primary"
                onClick={() => {
                    changeTime({_id, time: time.toDate()});
                    typeof hide === "function" && hide();
                }}
            >
                {t("leads.change")}
            </Button>
        </>
    );
});

const visibleChangeHandler = (type, onChange, _id) => {
    return visible => {
        if (visible) {
            onChange(`${_id}${type}`);
        } else {
            onChange(null);
        }
    };
};

export const ActiveTasks = memo(({tasks, lead}) => {
    const [visiblePopover, setVisiblePopover] = useState("");
    const [user] = useGlobalState("user");
    const [affixed, setAffixedStatus] = useState();
    const queryClient = useQueryClient();
    const {mutate: deleteTask} = useDataMutation("/tasks/delete", {
        onSuccess: () => {
            queryClient.invalidateQueries("tasks");
        },
    });
    const {data: users} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const {t} = useTranslation();
    return tasks.map(task => {
        const tm = moment(task.complete_till);
        const time = tm.format("DD.MM.YYYY HH:mm");
        const overdue = moment().isAfter(tm);
        const inTime = overdue && tm.clone().add(1, "hour").isAfter(moment());
        const c = color(inTime ? "yellow" : overdue ? "red" : "green", 0);
        return (
            <Affix offsetTop={20} onChange={setAffixedStatus} key={task._id}>
                <ActiveTasksContainer>
                    <Container key={task._id}>
                        <TaskContainer color={c} affixed={affixed}>
                            <Meta
                                title={
                                    <Flex justifyBetween>
                                        <Text ellipsis>
                                            <ResponsibleManagerBadge
                                                user={users.find(user => user.login === task.responsible)}
                                            />
                                            {task.text ?? t("leads.contactCustomer")}
                                        </Text>
                                        <div>
                                            <Space>
                                                <LimitedView
                                                    groups={[(g, user) => user?.access?.tasks?.canDeleteTasks]}
                                                >
                                                    <Popconfirm
                                                        title={`${t("leads.AreYouSureToDelete")}?`}
                                                        okText={t("leads.yes")}
                                                        onConfirm={() => deleteTask({_id: task._id})}
                                                        cancelText={t("leads.No")}
                                                    >
                                                        <Button danger icon={<DeleteOutlined />} ghost>
                                                            {t("leads.delete")}
                                                        </Button>
                                                    </Popconfirm>
                                                </LimitedView>
                                                <LimitedView groups={[(g, user) => user?.access?.tasks?.canCloseTasks]}>
                                                    <Popover
                                                        visible={visiblePopover === `${task._id}complete`}
                                                        onVisibleChange={visibleChangeHandler(
                                                            "complete",
                                                            setVisiblePopover,
                                                            task._id,
                                                        )}
                                                        content={
                                                            <FinishTask
                                                                _id={task._id}
                                                                lead={lead}
                                                                hide={() => setVisiblePopover(null)}
                                                                quickDiscard={user.title === "sales manager"}
                                                            />
                                                        }
                                                        title={`${t("leads.pleaseEnterResult")}:`}
                                                        trigger="click"
                                                        placement="bottomLeft"
                                                    >
                                                        <SuccessButton>{t("leads.done")}</SuccessButton>
                                                    </Popover>
                                                </LimitedView>
                                                <LimitedView
                                                    groups={[(g, user) => user?.access?.tasks?.canRescheduleTasks]}
                                                >
                                                    <Popover
                                                        visible={visiblePopover === `${task._id}postpone`}
                                                        onVisibleChange={visibleChangeHandler(
                                                            "postpone",
                                                            setVisiblePopover,
                                                            task._id,
                                                        )}
                                                        content={
                                                            <PostponeTask
                                                                defaultTime={tm}
                                                                _id={task._id}
                                                                lead={task._lead}
                                                                hide={() => setVisiblePopover(null)}
                                                            />
                                                        }
                                                        title={`${t("leads.howCome")}?`}
                                                        trigger="click"
                                                        placement="bottomLeft"
                                                    >
                                                        <FailureButton>{t("leads.postpone")}</FailureButton>
                                                    </Popover>
                                                </LimitedView>
                                            </Space>
                                        </div>
                                    </Flex>
                                }
                                description={
                                    <Flex justifyBetween>
                                        <Popover
                                            trigger="click"
                                            title={t("leads.reschedule")}
                                            visible={
                                                visiblePopover === `${task._id}reschedule` &&
                                                user?.access?.tasks?.canRescheduleTasks
                                            }
                                            onVisibleChange={visibleChangeHandler(
                                                "reschedule",
                                                setVisiblePopover,
                                                task._id,
                                            )}
                                            content={
                                                <ChangeTime
                                                    hide={() => setVisiblePopover(null)}
                                                    _id={task._id}
                                                    defaultTime={tm}
                                                />
                                            }
                                        >
                                            <Space>
                                                <span>
                                                    {t("leads.till")} {time}
                                                </span>
                                                <ClockCircleOutlined />
                                            </Space>
                                        </Popover>
                                        {!overdue && <StyledCountdown value={tm} format="HH:mm:ss:SSS" />}
                                    </Flex>
                                }
                            />
                        </TaskContainer>
                    </Container>
                </ActiveTasksContainer>
            </Affix>
        );
    });
});
