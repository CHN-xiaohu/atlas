import {memo, useCallback, useEffect, useMemo, useState} from "react";
import moment from "moment";
import {
    BulbOutlined,
    CameraOutlined,
    CloseOutlined,
    DownOutlined,
    MailOutlined,
    PaperClipOutlined,
    PushpinOutlined,
    ThunderboltOutlined,
    FileAddOutlined,
} from "@ant-design/icons";
import {
    Button,
    DatePicker,
    Dropdown,
    Input,
    Menu,
    Row,
    Col,
    message,
    Select,
    Modal,
    Divider,
    Form,
    Space,
    Upload,
    Avatar,
} from "antd";
import {color, getImageLink} from "../../../../../Helper";
import styled from "styled-components";
import {Flex} from "../../../../../styled/flex";
import {generateHtml} from "../../../../mailbox/Mailer";
import {CompatiblePictureWall} from "pages/common/PictureWall";
import {Spinner} from "../../../../common/Spinner";
import {useToggle} from "../../../../../hooks/useToggle";
import {useDataMutation} from "../../../../../hooks/useDataMutation";
import {useQuery, useQueryClient} from "react-query";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "../../../../../hooks/useGlobalState";
import {files as contracts} from "../../../../../data/files";

const {TextArea} = Input;

const EntityFormContainer = styled.div`
    padding: 0.5rem 1rem 1rem 1rem;
    ${props => props.shadow && `box-shadow: 0 0 5px 5px ${color("grey", 0, 0.3)}`}
`;
const Item = styled(Form.Item)`
    margin-bottom: 0.5rem !important;
`;

const noop = () => {};
const entities = [
    {
        key: "note",
        label: "leads.note",
        icon: <PushpinOutlined />,
        hide: user => !user?.access?.leads?.canAddNotes,
    },
    {
        key: "task",
        label: "leads.task",
        icon: <BulbOutlined />,
        hide: user => !user?.access?.tasks?.canAddTasks,
    },
    {
        key: "email",
        label: "leads.email",
        icon: <MailOutlined />,
        hide: user => !user?.access?.mailer?.canSendMessages,
    },
    {
        key: "photos",
        label: "leads.photos",
        icon: <CameraOutlined />,
        hide: user => !user?.access?.leads?.canAddNotes,
    },
];

const fileToBase64 = file =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.slice(reader.result.indexOf(",") + 1));
        reader.onerror = error => reject(error);
    });

const EmailForm = memo(({lead}) => {
    const {t} = useTranslation();
    const [replyEmail, setReplyEmail] = useGlobalState("replyEmail");
    const defaultRecipient = useMemo(() => {
        if (replyEmail?.from?.address) {
            return replyEmail?.from?.address;
        }
        if (Array.isArray(lead.contacts)) {
            const emails = lead.contacts.map(contact => contact.email).filter(email => email != null);
            return emails.length > 0 ? emails[0] : "";
        }
        return "";
    }, [lead, replyEmail]);
    const [from, setFrom] = useState("info@globus.furniture");
    const [recipient, setRecipient] = useState(defaultRecipient);
    const [subject, setSubject] = useState("");
    const [innerFiles, setInnerFiles] = useState([]);
    const [otherFiles, setOtherFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const {mutate: sendMail} = useDataMutation("/emails/send");

    const [template, setTemplate] = useState();
    const [fields, setFields] = useState({});
    const {data: templates} = useQuery(["templates"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const {data: globusEmails} = useQuery(
        [
            "emails",
            {
                method: "boxes",
            },
        ],
        {placeholderData: [], staleTime: 4 * 60 * 60 * 1000, cacheTime: 4 * 60 * 60 * 1000},
    );
    const templatesForCurrentLead = templates?.filter(
        t =>
            ((t.language === "Russian" && lead.russianSpeaking) ||
                (t.language === "English" && !lead.russianSpeaking)) &&
            t.published === true,
    );
    const activeTemplate = useMemo(() => templatesForCurrentLead?.find(t => t.name === template), [
        template,
        templatesForCurrentLead,
    ]);
    const changeTemplate = useCallback(
        name => {
            const template = templatesForCurrentLead?.find(t => t.name === name);

            if (template != null) {
                setSubject(
                    replyEmail.messageId == null
                        ? template.subject
                        : replyEmail?.subject?.startsWith("Re")
                        ? replyEmail?.subject
                        : `Re: ${replyEmail?.subject}`,
                );
                console.log("template.file: ", template.files);
                setInnerFiles(Array.isArray(template.files) ? [...template.files] : []);
                setFields(
                    template.tags.reduce((acc, tag) => {
                        acc[tag.tag] = tag.default;
                        return acc;
                    }, {}),
                );
                setTemplate(name);
            }
        },
        [setSubject, setTemplate, templatesForCurrentLead, replyEmail],
    );

    useEffect(() => {
        setOtherFiles(otherFiles =>
            innerFiles
                .filter(filename => !contracts.includes(filename))
                .map(filename => otherFiles.find(file => file.name === filename)),
        );
    }, [innerFiles]);

    useEffect(() => {
        if (Array.isArray(templatesForCurrentLead) && templatesForCurrentLead.length > 0 && template == null) {
            changeTemplate(templatesForCurrentLead[0].name);
        }
    }, [templatesForCurrentLead, changeTemplate, template]);
    useEffect(() => {
        if (replyEmail.messageId != null) {
            setSubject(replyEmail?.subject.startsWith("Re") ? replyEmail?.subject : `Re: ${replyEmail?.subject}`);
            setRecipient(replyEmail?.from?.address);
            const from = replyEmail?.to?.address;
            setFrom(from != null && globusEmails?.find(gm => gm.name === from) ? from : "info@globus.furniture");
        }
    }, [setSubject, setRecipient, replyEmail, setFrom, globusEmails]);
    const sendMessage = useCallback(async () => {
        setLoading(true);
        message.loading(t("pages.sendingMessage"), 100);
        // const from = replyEmail?.to?.match(/<([^()]+)>/)[1];
        const account = globusEmails.find(({name}) => name === from)?.account;
        const attachments = await Promise.all(
            otherFiles.map(async file => {
                const content = await fileToBase64(file);
                return {
                    filename: file.name,
                    content,
                    contentType: file.type,
                    contentDisposition: "attachment",
                    cid: file.uid,
                    encoding: "base64",
                };
            }),
        );

        try {
            sendMail(
                {
                    from,
                    to: recipient,
                    data: generateHtml(activeTemplate, {tags: fields, to: recipient}),
                    subject,
                    files: innerFiles.filter(filename => contracts.includes(filename)),
                    otherFiles: attachments,
                    tags: fields,
                    account,
                    template: template,
                    senderName: activeTemplate.language === "Russian" ? "Компания Глобус" : "The Globus Limited",
                },
                {
                    onSuccess(response) {
                        message.destroy();
                        setLoading(false);
                        setSubject("");
                        // setFields(
                        //     activeTemplate.tags.reduce((acc, tag) => {
                        //         acc[tag.tag] = tag.default;
                        //         return acc;
                        //     }, {}),
                        // );
                        if (response != null && response.messageId) {
                            message.success(t("pages.messageSent"));
                            if (Array.isArray(templatesForCurrentLead) && templatesForCurrentLead.length > 0) {
                                changeTemplate(templatesForCurrentLead[0].name);
                            }
                        } else if (response != null && response.error != null) {
                            console.log("failed to send message", response.error);
                            message.error(t("pages.failedToSendTheMessage"));
                        } else {
                            message.info(t("pages.probablyNotSentо"));
                        }
                    },
                    onError(response) {
                        console.log("failed to send message", response?.error);
                        message.error(t("pages.failedToSendTheMessage"));
                    },
                },
            );
        } catch (e) {
            console.error(e);
            message.destroy();
            message.error(t("pages.error"));
        }
    }, [
        innerFiles,
        otherFiles,
        activeTemplate,
        t,
        recipient,
        globusEmails,
        sendMail,
        subject,
        fields,
        template,
        from,
        changeTemplate,
        templatesForCurrentLead,
    ]);

    if (!Array.isArray(templates)) {
        return <Spinner />;
    }
    return (
        <div>
            <Form layout="vertical" style={{padding: "1rem 0"}}>
                {replyEmail.messageId != null && (
                    <Item label={t("leads.replyTo")}>
                        <div>
                            <Space>
                                <span>{replyEmail?.subject}</span>
                                <CloseOutlined onClick={() => setReplyEmail({})} style={{cursor: "pointer"}} />
                            </Space>
                        </div>
                    </Item>
                )}
                <Row gutter={16}>
                    <Col span={12}>
                        <Item label={t("leads.template")}>
                            <Select
                                defaultValue="General"
                                value={template}
                                onChange={changeTemplate}
                                loading={templatesForCurrentLead.length === 0}
                            >
                                {templatesForCurrentLead.map(template => (
                                    <Select.Option value={template.name} key={template._id}>
                                        {template.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Item>
                    </Col>
                    <Col span={12}>
                        <Item label={t("leads.subject")}>
                            <Input
                                disabled={loading}
                                value={subject}
                                onChange={({target}) => setSubject(target.value)}
                            />
                        </Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Item label="发件人">
                            <Select
                                optionFilterProp="children"
                                onChange={mail => setFrom(mail)}
                                placeholder={t("pages.typeEmail")}
                                value={from}
                                allowClear
                            >
                                {globusEmails.map(({account, name}) => (
                                    <Select.Option key={account} value={name}>
                                        {name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Item>
                    </Col>
                    <Col span={12}>
                        <Item label={t("leads.recipient")}>
                            <Input
                                disabled={loading}
                                value={recipient}
                                onChange={({target}) => setRecipient(target.value)}
                            />
                        </Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Item label={t("pages.attachedFiles")}>
                            <div style={{display: "flex"}}>
                                <Select
                                    mode="multiple"
                                    style={{flex: 1}}
                                    placeholder={t("pages.noFilesAttached")}
                                    value={innerFiles}
                                    onChange={files => setInnerFiles([...files])}
                                    disabled={template == null}
                                >
                                    {contracts
                                        .filter(file => !innerFiles.includes(file))
                                        .map(file => {
                                            return (
                                                <Select.Option key={file} value={file}>
                                                    {file}
                                                </Select.Option>
                                            );
                                        })}
                                </Select>
                                <Upload
                                    multiple
                                    showUploadList={false}
                                    beforeUpload={() => false}
                                    onChange={({file, fileList}) => {
                                        setInnerFiles([...innerFiles, file.name]);
                                        setOtherFiles(fileList.map(file => file.originFileObj));
                                    }}
                                >
                                    <Button type="primary" disabled={template == null} icon={<FileAddOutlined />} />
                                </Upload>
                            </div>
                        </Item>
                    </Col>
                </Row>

                {activeTemplate &&
                    activeTemplate.tags.map(tag => {
                        if (tag.type === "TextArea") {
                            return (
                                <Item label={tag.label} key={tag.tag}>
                                    <TextArea
                                        disabled={loading}
                                        autoSize={{minRows: 2}}
                                        value={fields[tag.tag]}
                                        onChange={({target}) => setFields({...fields, [tag.tag]: target.value})}
                                    />
                                </Item>
                            );
                        } else {
                            return (
                                <Item label={tag.label}>
                                    <Input
                                        disabled={loading}
                                        value={fields[tag.tag]}
                                        onChange={({target}) => setFields({...fields, [tag.tag]: target.value})}
                                    />
                                </Item>
                            );
                        }
                    })}
            </Form>
            <Flex justifyBetween>
                <div />
                <div>
                    <Button
                        disabled={loading}
                        loading={loading}
                        icon={<MailOutlined />}
                        type="primary"
                        onClick={async () => {
                            const html = generateHtml(activeTemplate, {tags: fields, to: recipient});
                            Modal.confirm({
                                title: t("leads.preview"),
                                content: <div dangerouslySetInnerHTML={{__html: html}} />,
                                okText: t("leads.send"),
                                okButtonProps: {
                                    icon: <MailOutlined />,
                                },
                                width: 600,
                                onOk: () => sendMessage(html),
                            });
                        }}
                    >
                        {t("leads.send")}
                    </Button>
                    <Divider type="vertical" />
                    <Button
                        icon={<ThunderboltOutlined />}
                        disabled={loading}
                        loading={loading}
                        onClick={() => {
                            const html = generateHtml(activeTemplate, {tags: fields, to: recipient});
                            sendMessage(html);
                        }}
                    >
                        {t("leads.quickSend")}
                    </Button>
                </div>
            </Flex>
        </div>
    );
});

const DropDownMenu = memo(({entity, changeEntity, options}) => {
    const {t} = useTranslation();

    const activeOption = options.find(e => e.key === entity);
    return (
        <Dropdown
            placement="topLeft"
            overlay={
                <Menu>
                    {options.map(option => (
                        <Menu.Item
                            key={option?.key}
                            onClick={() => {
                                changeEntity(option?.key);
                            }}
                        >
                            {option?.icon} {t(option?.label)}
                        </Menu.Item>
                    ))}
                </Menu>
            }
        >
            <span>
                {activeOption?.icon} {t(activeOption?.label)} <DownOutlined />
            </span>
        </Dropdown>
    );
});

const NoteForm = memo(({lead}) => {
    const queryClient = useQueryClient();
    const {mutate: addNote} = useDataMutation("/notes/add", {
        onSuccess: () => {
            queryClient.invalidateQueries("notes");
        },
    });
    const [text, setText] = useState("");
    const [files, setFiles] = useState([]);
    const [uploading, toggleUploading] = useToggle(false);
    const {t} = useTranslation();
    return (
        <Input.Group>
            <Row type="flex" style={{alignItems: "center", flexFlow: "row"}}>
                <Space direction="vertical" style={{flexGrow: 1, marginRight: "1rem"}}>
                    <TextArea
                        onChange={({target}) => setText(target.value)}
                        value={text}
                        placeholder={t("leads.newNote")}
                        style={{resize: "none"}}
                        autoSize={{minRows: 2}}
                    />
                    <Upload
                        multiple
                        action="https://api.globus.furniture/files/upload/file"
                        onChange={({fileList, file}) => {
                            if (file.status === "removed") {
                                setFiles(files.filter(f => f._id !== file.response._id));
                            }
                            if (file.status === "done" && files.find(f => file.response._id === f._id) == null) {
                                console.log("update", [...files, file.response]);
                                setFiles([...files, file.response]);
                            }

                            toggleUploading(fileList.filter(({status}) => status !== "done").length > 0);
                        }}
                    >
                        <Button size="small" icon={<PaperClipOutlined />}>
                            {t("leads.attachFile")}
                        </Button>
                    </Upload>
                </Space>

                <Button
                    onClick={() => {
                        addNote({lead, text, type: "text", files});
                        setText("");
                    }}
                    size="large"
                    loading={uploading}
                    disabled={uploading || text.length === 0}
                    type="primary"
                    style={{marginLeft: ".5rem"}}
                >
                    {t("leads.add")}
                </Button>
            </Row>
        </Input.Group>
    );
});

export const TaskForm = memo(({lead, onSuccess = noop}) => {
    const queryClient = useQueryClient();
    const {t} = useTranslation();
    const [text, setText] = useState("");
    const [time, setTime] = useState(moment({hour: 19, minutes: 0}));
    const [responsible, setResponsible] = useState(lead.responsible);
    const {mutate: addTask} = useDataMutation("/tasks/add", {
        onSuccess: () => {
            queryClient.invalidateQueries("tasks");
        },
    });
    const taskAdder = async () => {
        await addTask({completeTill: time.toDate(), text, lead: lead._id, responsible});
        setText("");
        setTime(moment({hour: 19, minutes: 0}));
        onSuccess();
    };
    const managers = lead.managers ?? [];
    const {data: users} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });

    const candidates = users.filter(user => {
        if (user.banned) {
            return false;
        }
        if (
            typeof user.title === "string" &&
            user.title.includes("manager") &&
            user?.access?.leads?.canSeeAllLeads &&
            (responsible == null || responsible === user.login)
        ) {
            return true;
        }
        if (typeof user.title === "string" && user.title.includes("manager") && managers.includes(user.login)) {
            return true;
        }
        return false;
    });
    return (
        <Form layout="vertical">
            <Item label={t("leads.responsibleManager")}>
                <Select value={responsible ?? null} onChange={responsible => setResponsible(responsible)}>
                    <Select.Option value={null}>
                        <Space>
                            <div style={{paddingLeft: "8px"}}>
                                <Avatar.Group size="small">
                                    {candidates.map(m => (
                                        <Avatar
                                            key={`avatar-${m._id}`}
                                            src={getImageLink(m?.avatar, "avatar_webp", m?.session)}
                                        />
                                    ))}
                                </Avatar.Group>
                            </div>
                            {t("leads.everybody")}
                        </Space>
                    </Select.Option>
                    {candidates.map(m => (
                        <Select.Option key={m._id} value={m.login}>
                            <Space>
                                <Avatar size="small" src={getImageLink(m?.avatar, "avatar_webp", m?.session)} />
                                {m.name}
                            </Space>
                        </Select.Option>
                    ))}
                </Select>
            </Item>
            <Item label={t("leads.description")}>
                <Input
                    onPressEnter={taskAdder}
                    value={text}
                    placeholder={t("leads.taskDescription")}
                    onChange={({target}) => setText(target.value)}
                    allowClear
                />
            </Item>
            <Item label={t("leads.completeTill")}>
                <Flex justifyBetween>
                    <DatePicker
                        format="YYYY-MM-D HH:mm"
                        showTime={{minuteStep: 5, format: "HH:mm"}}
                        value={time}
                        disabledDate={date => date.isBefore(moment())}
                        onChange={time => setTime(time)}
                    />
                    <Button
                        size="large"
                        onClick={taskAdder}
                        type="primary"
                        disabled={text.length === 0 || time == null}
                    >
                        {t("leads.add")}
                    </Button>
                </Flex>
            </Item>
        </Form>
    );
});

const PhotoForm = memo(({lead}) => {
    const queryClient = useQueryClient();
    const {mutate: addNote} = useDataMutation("/notes/add", {
        onSuccess: () => {
            queryClient.invalidateQueries("notes");
        },
    });
    const {t} = useTranslation();
    const [photos, setPhotos] = useState([]);
    const [loading, toggle] = useToggle(false);
    return (
        <Flex justifyBetween alignCenter>
            <CompatiblePictureWall
                imageHeight="9rem"
                uploadWidth="9rem"
                uploadHeight="9rem"
                max={9}
                files={photos}
                onChange={setPhotos}
            />
            <Button
                type="primary"
                size="large"
                loading={loading}
                disable={loading || photos.length === 0}
                onClick={() => {
                    toggle();
                    addNote({
                        lead,
                        type: "photos",
                        photos,
                    });
                    setPhotos([]);
                    toggle(false);
                }}
            >
                {t("leads.add")}
            </Button>
        </Flex>
    );
});

export const EntityForm = memo(({lead}) => {
    const [replyEmail] = useGlobalState("replyEmail");
    const [user] = useGlobalState("user");
    const options = useMemo(
        () =>
            entities.filter(({hide}) => {
                if (typeof hide === "function") {
                    return !hide(user);
                }
                return true;
            }),
        [user],
    );
    const [entity, setEntity] = useState();
    useEffect(() => {
        if (options.length > 0) {
            setEntity(options[0].key);
        }
    }, [options]);
    useEffect(() => {
        if (replyEmail.messageId != null) {
            setEntity("email");
        }
    }, [replyEmail]);
    return (
        <EntityFormContainer>
            <DropDownMenu entity={entity} options={options} changeEntity={setEntity} />
            {entity === "note" && <NoteForm lead={lead._id} changeEntity={setEntity} />}
            {entity === "task" && <TaskForm lead={lead} changeEntity={setEntity} />}
            {entity === "email" && <EmailForm lead={lead} changeEntity={setEntity} />}
            {entity === "photos" && <PhotoForm lead={lead._id} changeEntity={setEntity} />}
        </EntityFormContainer>
    );
});
