import {memo, useMemo, useState, useCallback, createContext, useContext} from "react";
import {Button, Radio, Table, Tag, Pagination, Badge, Tooltip, Typography} from "antd";
import moment from "moment";
import {EyeOutlined, ReadOutlined, InboxOutlined, EyeInvisibleOutlined, PlusOutlined, SendOutlined, RollbackOutlined} from "@ant-design/icons";
import {EmailView} from "./mailbox/EmailView";
import styled from "styled-components";
import {color, leadName} from "../Helper";
import {useHistory, Route} from "react-router-dom";
import {LeadCreator} from "./leads/LeadCreator";
import {Spinner} from "./common/Spinner";
import {useTranslation} from "react-i18next";
import {useQuery, useQueryClient} from "react-query";
import {Window as MailBoxWindow} from "./mailbox/Window";
import {useDataMutation} from "../hooks/useDataMutation";

const {Text} = Typography;

const FilterHeaderWrapper = styled.div`
    display: flex;
    align-items: center;
    height: 50px;
    padding: 0 36px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 1px #fff;
    white-space: nowrap;
`;

const ScrollContent = styled.div`
    height: calc(100% - 100px);
    padding: 20px 36px;
    overflow-y: auto;
`;

const StyledTable = styled(Table)`
    tr.outgoing td {
        background-color: ${color("grey", 0, 0.1)};
    }

    tr.unread td {
        font-weight: 700;
    }
`;

const StyledPagination = styled(Pagination)`
    display: flex;
    justify-content: flex-end;
    padding: 12px 60px;
`;

export const LeadTag = styled(Tag)`
    cursor: pointer !important;
`;

export const SettingsContext = createContext({});
export const SettingsDispatcherContext = createContext();

const defaultSettings = {
    visible: false,
    subject: "",
    html: "",
    files: [],
    from: "info@globus.furniture",
};

const SettingsProvider = memo(({children}) => {
    const [template, setTemplate] = useState(null);
    const [settings, setSettings] = useState({...defaultSettings});

    const resetSettings = useCallback(
        (settings = {}) => {
            setTemplate(null);
            setSettings({...defaultSettings, ...settings});
        },
        [setTemplate, setSettings],
    );

    return (
        <SettingsContext.Provider value={{template, settings}}>
            <SettingsDispatcherContext.Provider value={{setTemplate, setSettings, resetSettings}}>
                {children}
            </SettingsDispatcherContext.Provider>
        </SettingsContext.Provider>
    );
});

export const MailList = memo(
    ({mail, range = "all", rowSelection, readState = "all", markRead, page = 1, amount = 50}) => {
        const {t} = useTranslation();
        const [activeEmail, setActiveEmail] = useState();
        const [creatingLead, setCreatingLead] = useState();
        const {setSettings, resetSettings} = useContext(SettingsDispatcherContext);

        const {data: pipelines} = useQuery(["pipelines"], {
            placeholderData: [],
            staleTime: 4 * 60 * 60 * 1000,
            cacheTime: 4 * 60 * 60 * 1000,
        });

        const {data: mails} = useQuery(
            [
                "emails",
                {
                    method: "messages",
                    boxes: mail ? [mail] : null,
                    range,
                    readState,
                    skip: (page - 1) * amount,
                    limit: amount,
                },
            ],
            {
                placeholderData: [],
                keepPreviousData: true,
            },
        );

        const {data: boxes} = useQuery(
            [
                "emails",
                {
                    method: "boxes",
                },
            ],
            {
                placeholderData: [],
                staleTime: 4 * 60 * 60 * 1000,
                cacheTime: 4 * 60 * 60 * 1000,
            },
        );

        const globusEmails = boxes.map(({name}) => name);

        const {data: leads} = useQuery(
            [
                "leads",
                {
                    emails: [
                        ...new Set(
                            mails
                                .map(({from, to}) => {
                                    // return [from, to];
                                    return [
                                        from?.name ? `${from.name} <${from.address}>` : from?.address,
                                        to?.name ? `${to.name} <${to.address}>` : to?.address,
                                    ];
                                })
                                .flat(),
                        ),
                    ].filter(
                        mail => mail && mail.length !== 0 && globusEmails.find(gm => mail.includes(gm)) == null, //&&
                        //leads.find(lead => mail.includes(lead.email)) == null,
                    ),
                },
            ],
            {
                enabled: Array.isArray(mails) && mails.length > 0,
                placeholderData: [],
            },
        );

        const handleMarkRead = useCallback(
            (id, state) => {
                markRead({ids: [id], state});
            },
            [markRead],
        );

        const handleReplyEmail = useCallback(
            ({subject, from, to, messageId}) => {
                const sender = to?.address;
                const reciept = from?.address;
                const settings = {
                    ...defaultSettings,
                    visible: true,
                    subject: `Re: ${subject}`,
                    from: globusEmails.includes(sender) ? sender : reciept,
                    to: reciept,
                    messageId,
                };
                resetSettings();
                setSettings(settings);
            },
            [setSettings, resetSettings, globusEmails],
        );

        const history = useHistory();
        const columns = useMemo(() => {
            return [
                {
                    title: t("pages.sender"),
                    dataIndex: "from",
                    render: (from, row) => {
                        if (from && from.name) {
                            return (
                                <Tooltip placement="bottom" title={from.address}>
                                    <Text>{from?.name?.replace(/"?\\?/g, "")}</Text>
                                </Tooltip>
                            );
                        }
                        return <Text>{from?.address}</Text>;
                    },
                },
                {
                    title: t("pages.recipient"),
                    dataIndex: "to",
                    render: to => {
                        if (to && to.name) {
                            return (
                                <Tooltip placement="bottom" title={to?.address}>
                                    <Text>{to?.name?.replace(/"?\\?/g, "")}</Text>
                                </Tooltip>
                            );
                        }
                        return <Text>{to?.address}</Text>;
                    },
                },
                {
                    title: t("pages.subject"),
                    dataIndex: "subject",
                },
                {
                    title: t("pages.date"),
                    dataIndex: "date",
                    render: date => {
                        const m = moment(date);
                        return m.format("HH:mm DD.MM.YY ");
                    },
                },
                {
                    title: t("pages.lead"),
                    dataIndex: "lead",
                    render: (lead, row) => {
                        if (lead != null) {
                            return (
                                <LeadTag
                                    onClick={event => {
                                        event.stopPropagation();
                                        history.push(`/leads/${lead._id}`);
                                    }}
                                    color={color(pipelines.find(pipe => pipe.id === lead.status_id).color)}
                                >
                                    {leadName(lead)}
                                </LeadTag>
                            );
                        }
                        return (
                            <Button
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={event => {
                                    event.stopPropagation();
                                    setCreatingLead(row?.from?.address ?? true);
                                }}
                            >
                                {t("pages.create")}
                            </Button>
                        );
                    },
                },
                {
                    title: t("pages.actions"),
                    width: 130,
                    render: (el, row) => (
                        <div style={{display: "flex", justifyContent: "space-around"}}>
                            <Badge dot={!row.isRead}>
                                <Tooltip title={t("pages.view")}>
                                    <Button
                                        type="circle"
                                        icon={<ReadOutlined />}
                                        onClick={event => {
                                            event.stopPropagation();
                                            setActiveEmail(row);
                                        }}
                                    />
                                </Tooltip>
                            </Badge>
                            <Tooltip title={row.isRead ? t("mailbox.markAsUnread") : t("mailbox.markAsRead")}>
                                <Button
                                    type="circle"
                                    icon={row.isRead ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                    onClick={event => {
                                        event.stopPropagation();
                                        handleMarkRead(row._id, !row.isRead);
                                    }}
                                />
                            </Tooltip>
                            <Tooltip title={t("mailbox.reply")}>
                                <Button
                                    type="circle"
                                    icon={<RollbackOutlined />}
                                    onClick={event => {
                                        event.stopPropagation();
                                        handleReplyEmail(row);
                                    }}
                                />
                            </Tooltip>
                        </div>
                    ),
                },
            ];
        }, [setActiveEmail, pipelines, history, t, handleMarkRead, handleReplyEmail]);
        //request data depending on params
        if (!Array.isArray(mails)) {
            return <Spinner />;
        }
        const data = mails
            .map(mail => ({
                ...mail,
                lead: leads.find(lead => {
                    const contacts = lead.contacts;
                    return (
                        Array.isArray(contacts) &&
                        contacts.find(
                            contact =>
                                typeof contact.email === "string" &&
                                contact.email.length > 0 &&
                                ((typeof mail?.from?.address === "string" &&
                                    mail.from.address.toLocaleLowerCase().includes(contact.email.toLocaleLowerCase())) ||
                                    (typeof mail?.to?.address === "string" &&
                                        contact.email.length > 0 &&
                                        mail.to.address.toLocaleLowerCase().includes(contact.email.toLocaleLowerCase()))),
                        )
                    );
                }),
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        return (
            <>
                <StyledTable
                    rowSelection={rowSelection}
                    size="middle"
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    rowClassName={row => {
                        return (
                            (!row.isRead ? "unread" : "") +
                            (globusEmails.includes(row?.from?.address) ? "" : " outgoing")
                        );
                    }}
                    onRow={row => {
                        return {
                            onClick: () => setActiveEmail(row),
                        };
                    }}
                />
                {activeEmail && (
                    <EmailView
                        onClose={() => setActiveEmail(null)}
                        visible={true}
                        pipelines={pipelines}
                        markRead={markRead}
                        onIsNotLead={id => {
                            setActiveEmail(null);
                            markRead({ids: [id], state: true});
                        }}
                        {...data.find(mail => mail._id === activeEmail._id)}
                    />
                )}
                <LeadCreator visible={creatingLead} id={creatingLead} onClose={() => setCreatingLead(null)} />
            </>
        );
    },
);

const MailPagination = memo(({mail, page, pageSize, range = "all", readState = "all", onChange, onShowSizeChange}) => {
    const {data: total} = useQuery(
        [
            "emails",
            {
                method: "count",
                boxes: mail ? [mail] : null,
                range,
                readState,
            },
        ],
        {
            placeholderData: 0,
        },
    );

    return (
        <StyledPagination
            showQuickJumper
            current={page}
            total={total}
            pageSize={pageSize}
            onChange={page => onChange(page)}
            onShowSizeChange={(_, size) => onShowSizeChange(size)}
        />
    );
});

export const MailBox = memo(() => {
    const {t} = useTranslation();
    const [emailRange, setEmailRange] = useState("all");
    const [readState, setReadState] = useState("all");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const queryClient = useQueryClient();

    const {mutate: markRead, isLoading: markReadLoading} = useDataMutation("/emails/markRead", {
        onSuccess: () => {
            queryClient.invalidateQueries("emails");
        },
    });

    const onPaginationChange = useCallback(page => setPage(page), [setPage]);

    const onShowSizeChange = useCallback(
        size => {
            setPage(1);
            setPageSize(size);
        },
        [setPage, setPageSize],
    );

    const onMarkRead = useCallback(
        (multi = false) => {
            if (!markReadLoading) {
                markRead(
                    {ids: selectedRowKeys},
                    {
                        onSuccess() {
                            setSelectedRowKeys([]);
                        },
                    },
                );
            }
        },
        [selectedRowKeys, markRead, markReadLoading],
    );

    return (
        <Route
            path="/mails/:mail?"
            render={({match}) => {
                const mail = match?.params?.mail;
                return (
                    <SettingsProvider>
                        <MailBoxWindow>
                            <FilterHeaderWrapper>
                                <Button
                                    type="primary"
                                    icon={<EyeOutlined />}
                                    onClick={onMarkRead}
                                    disabled={selectedRowKeys.length === 0}
                                >
                                    {t("mailbox.markAsRead")}
                                </Button>
                                <Radio.Group
                                    value={emailRange}
                                    onChange={e => setEmailRange(e.target.value)}
                                    style={{marginLeft: 30}}
                                >
                                    <Radio.Button value="all">{t("mailbox.all")}</Radio.Button>
                                    <Radio.Button value="recieved">
                                        <InboxOutlined /> {t("mailbox.inbox")}
                                    </Radio.Button>
                                    <Radio.Button value="sent">
                                        <SendOutlined /> {t("mailbox.sent")}
                                    </Radio.Button>
                                </Radio.Group>
                                <Radio.Group
                                    value={readState}
                                    onChange={e => setReadState(e.target.value)}
                                    style={{marginLeft: 30}}
                                >
                                    <Radio.Button value="all">{t("mailbox.all")}</Radio.Button>
                                    <Radio.Button value="unread">
                                        <EyeInvisibleOutlined /> {t("mailbox.unread")}
                                    </Radio.Button>
                                    <Radio.Button value="read">
                                        <EyeOutlined /> {t("mailbox.read")}
                                    </Radio.Button>
                                </Radio.Group>
                            </FilterHeaderWrapper>
                            <ScrollContent>
                                <MailList
                                    mail={mail}
                                    page={page}
                                    amount={pageSize}
                                    range={emailRange}
                                    readState={readState}
                                    rowSelection={{
                                        selectedRowKeys,
                                        onChange: keys => setSelectedRowKeys([...keys]),
                                    }}
                                    markRead={markRead}
                                />
                            </ScrollContent>
                            <MailPagination
                                mail={mail}
                                page={page}
                                pageSize={pageSize}
                                range={emailRange}
                                readState={readState}
                                onChange={onPaginationChange}
                                onShowSizeChange={onShowSizeChange}
                            />
                        </MailBoxWindow>
                    </SettingsProvider>
                );
            }}
        />
    );
});
