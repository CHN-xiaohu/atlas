import {memo, useState} from "react";
import {Avatar, Button, Checkbox, DatePicker, Drawer, Form, Input, Select, Space} from "antd";
import {LeadInfo} from "./lead/LeadInfo";
import {PlusOutlined} from "@ant-design/icons";
import {Flex} from "../../styled/flex";
import moment from "moment";
import {useHistory} from "react-router-dom";
import {color, getImageLink} from "../../Helper";
import styled from "styled-components";
import {useToggle} from "../../hooks/useToggle";
import {useImmer} from "../../hooks/useImmer";
import {useDataMutation} from "../../hooks/useDataMutation";
import {useQuery, useQueryClient} from "react-query";
import {useTranslation} from "react-i18next";
import {ContactsControl} from "./contacts/ContactsControl";
import {useGlobalState} from "hooks/useGlobalState";
const {TextArea} = Input;

const Item = styled(Form.Item)`
    margin-bottom: 0.5rem !important;
`;

const Warn = styled.div`
    color: ${color("red", 4)};
`;

export const LeadCreator = memo(({visible = false, onClose, template, onCreate, id}) => {
    const [user] = useGlobalState("user");
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const history = useHistory();
    const [lead, changeLead] = useState({
        source: "manual",
        status_id: 20674270,
        contacts: [],
        ...template,
    });
    const [assignTask, toggleTask] = useToggle(true);
    const [addNote, toggleNote] = useToggle(false);
    const [task, setTask] = useImmer({
        text: t("leads.contactCustomer"),
        time: moment().add(1, "hour"),
        responsible: lead.responsible,
    });
    const [note, setNote] = useState("");
    const {mutate: createLead} = useDataMutation("/leads/add", {
        onSuccess: ({_id: leadId}) => {
            queryClient.invalidateQueries("leads");
            history.push(`/leads/${leadId}/timeline`);
        },
    });
    const {mutate: createTask} = useDataMutation("/tasks/add", {
        onSuccess: () => {
            queryClient.invalidateQueries("tasks");
        },
    });
    const {mutate: createNote} = useDataMutation("/notes/add", {
        onSuccess: () => {
            queryClient.invalidateQueries("notes");
        },
    });

    const {data: originalUsers, isError} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
        enabled: user.session != null,
    });

    const users = isError ? originalUsers : (originalUsers ?? []);

    const salesManagers = users.filter(
        user => typeof user.title === "string" && user.title.includes("manager") && user?.access?.leads?.canSeeAllLeads,
    );

    const [valid, setValid] = useState();

    const handleValidChange = valid => {
        setValid(valid);
    };

    return (
        <Drawer width={800} title={t("leads.createNewLead")} visible={visible} closable={true} onClose={onClose}>
            <LeadInfo
                client={lead}
                onChange={(key, value) => {
                    changeLead({...lead, [key]: value});
                }}
                showReadOnly={false}
            />
            {!(lead.contacts.length > 0) && <Warn>（{t("leads.atLeastOneContactMethodIsRequired")}）</Warn>}
            <ContactsControl
                style={{margin: "8px 0"}}
                contacts={lead.contacts}
                onChange={contacts => {
                    changeLead({...lead, contacts});
                }}
                onValidChange={handleValidChange}
                switchShowAllAttributes={false}
                showAllAttributes={true}
            />
            <div>
                <Checkbox checked={assignTask} onChange={() => toggleTask()}>
                    {t("leads.assignATask")}
                </Checkbox>
                {assignTask && (
                    <Form layout="vertical">
                        <Item label={t("leads.responsibleManager")}>
                            <Select
                                value={task.responsible ?? null}
                                onChange={responsible => {
                                    setTask(draft => {
                                        draft.responsible = responsible;
                                    });
                                }}
                            >
                                <Select.Option value={null}>
                                    <Space>
                                        <div style={{paddingLeft: "8px"}}>
                                            <Avatar.Group size="small">
                                                {salesManagers.map(m => (
                                                    <Avatar key={`avatar-${m._id}`} size="small" src={getImageLink(m?.avatar, "avatar_webp", m?.session)} />
                                                ))}
                                            </Avatar.Group>
                                        </div>
                                        {t("leads.everybody")}
                                    </Space>
                                </Select.Option>
                                {salesManagers.map(m => (
                                    <Select.Option key={m._id} value={m.login}>
                                        <Space>
                                            <Avatar
                                                size="small"
                                                src={getImageLink(m?.avatar, "avatar_webp", m?.session)}
                                            />
                                            {m.name}
                                        </Space>
                                    </Select.Option>
                                ))}
                            </Select>
                        </Item>

                        <Item label={t("leads.description")}>
                            <Input
                                value={task.text}
                                placeholder={t("leads.taskDescription")}
                                onChange={({target}) => {
                                    setTask(draft => {
                                        draft.text = target.value;
                                    });
                                }}
                                allowClear
                            />
                        </Item>
                        <Item label={t("leads.completeTill")}>
                            <Flex justifyBetween>
                                <DatePicker
                                    format="YYYY-MM-D HH:mm"
                                    showTime={{minuteStep: 5, format: "HH:mm"}}
                                    value={task.time}
                                    disabledDate={date => date.isBefore(moment())}
                                    onChange={time => {
                                        setTask(draft => {
                                            draft.time = time;
                                        });
                                    }}
                                />
                            </Flex>
                        </Item>
                    </Form>
                )}
            </div>
            <div>
                <Checkbox checked={addNote} onChange={() => toggleNote()}>
                    {t("leads.addANote")}
                </Checkbox>
                {addNote && (
                    <TextArea
                        placeholder={t("leads.note")}
                        autoSize={{minRows: 3}}
                        value={note}
                        onChange={({target}) => setNote(target.value)}
                    />
                )}
            </div>
            <Button
                onClick={() => {
                    createLead(lead, {
                        onSuccess: l => {
                            if (assignTask) {
                                createTask({
                                    completeTill: task.time.toDate(),
                                    text: task.text,
                                    responsible: task.responsible,
                                    lead: l._id,
                                    priority: "high",
                                });
                            }
                            if (addNote) {
                                createNote({
                                    lead: l._id,
                                    type: "text",
                                    text: note,
                                });
                            }
                            typeof onCreate == "function" && onCreate(l);
                        },
                    });
                }}
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                style={{marginTop: "1rem"}}
                disabled={!valid || !(lead.contacts.length > 0)}
            >
                {t("leads.createLead")}
            </Button>
        </Drawer>
    );
});
