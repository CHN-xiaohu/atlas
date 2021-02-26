import moment from "moment";
import {Note} from "./timeline/Note";
import {EntityForm} from "./timeline/EntityForm";
import {memo, useMemo, useState, useEffect, useCallback, createContext} from "react";
import styled from "styled-components";
import {Checkbox, Timeline} from "antd";
import {useQuery} from "react-query";
import {LimitedView} from "../../../common/LimitedView";
import {ActiveTasks} from "../ActiveTasks";
import {useLocalStorage} from "@rehooks/local-storage";
import {useTranslation} from "react-i18next";
import {AutoScrollingContainer} from "../../../common/ResizeObserver";
import {useGlobalState} from "../../../../hooks/useGlobalState";

const options = [
    {
        label: "leads.photos",
        value: "photos",
    },
    {
        label: "leads.emails",
        value: "email",
    },
    {
        label: "leads.notes",
        value: "text",
    },
    {
        label: "leads.logs",
        value: "log",
    },
    {
        label: "leads.tasks",
        value: "task",
    },
];

const StyledTimeline = styled(Timeline)`
    margin-top: 6px !important;
    .ant-timeline-item-last {
        padding: 0;
    }
`;

const NotesContainer = styled.div`
    display: flex;
    flex-flow: column;
    justify-content: space-between;
    overflow-y: auto;
    height: 100%;
`;

export const ScrollViewContext = createContext(null);

const ScrollViewContextProvider = memo(({children, value}) => {
    return <ScrollViewContext.Provider value={value}>{children}</ScrollViewContext.Provider>;
});

const LeadTimelineInternal = memo(({lead, filters}) => {
    const [, setReplyEmail] = useGlobalState("replyEmail");
    const [scrollFixed, setScrollFixed] = useState(true);
    const [scrollEl, setScrollEl] = useState(null);
    const {notes, tasks, mails, logs} = lead;
    useEffect(() => {
        console.log("rest ReplyEmail");
        setReplyEmail({});
    }, [lead, setReplyEmail]);
    const data = useMemo(
        () =>
            [
                ...logs.map(log => ({
                    ...log,
                    entity: log.type,
                    type: "log",
                })),
                ...notes.filter(note => filters.includes(note.type)),
                ...tasks
                    .filter(task => task.status)
                    .map(task => ({
                        ...task,
                        type: "task",
                    })),
                ...mails.map(mail => ({...mail, type: "email"})),
            ]
                .filter(note => filters.includes(note.type))
                .sort((a, b) => {
                    const timeA = moment(a.created_at ?? a.time ?? a.date).unix();
                    const timeB = moment(b.created_at ?? b.time ?? b.date).unix();
                    return timeA - timeB;
                }),
        [filters, logs, mails, notes, tasks],
    );

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            scrollEl != null && (scrollEl.scrollTop = scrollEl.scrollHeight);
        }, 50);
    }, [scrollEl]);
    return (
        <NotesContainer>
            {
                <AutoScrollingContainer
                    style={{overflowY: "auto", flexGrow: 1}}
                    onRefChange={el => setScrollEl(el)}
                    scrollFixed={scrollFixed}
                    setScrollFixed={setScrollFixed}
                >
                    <ScrollViewContextProvider value={scrollToBottom}>
                        <StyledTimeline>
                            {data.map(note => {
                                return (
                                    <Timeline.Item key={note._id}>
                                        <Note note={note} />
                                    </Timeline.Item>
                                );
                            })}
                        </StyledTimeline>
                        <LimitedView
                            groups={[
                                (g, user) =>
                                    user?.access?.leads?.canAddNotes ||
                                    user?.access?.tasks?.canAddTasks ||
                                    user?.access?.mailer?.canSendMessages,
                            ]}
                        >
                            <EntityForm lead={lead} />
                        </LimitedView>
                    </ScrollViewContextProvider>
                </AutoScrollingContainer>
            }
        </NotesContainer>
    );
});

const TimelineWrapper = memo(({lead}) => {
    const [filters, setFilters] = useLocalStorage(
        "lead-filters",
        options.map(option => option.value),
    );
    const {t} = useTranslation();
    const {data: notes} = useQuery(
        [
            "notes",
            {
                method: "forLeads",
                leads: [lead._id],
            },
        ],
        {
            enabled: lead?._id != null,
            placeholderData: [],
        },
    );

    const {data: mails} = useQuery(
        [
            "emails",
            {
                method: "messages",
                boxes: lead.contacts.map(contact => contact.email).filter(email => email != null),
            },
        ],
        {
            enabled:
                Array.isArray(lead?.contacts) &&
                lead.contacts.map(contact => contact.email).filter(email => email != null).length > 0,
            placeholderData: [],
        },
    );
    const {data: logs} = useQuery(
        [
            "logs",
            {
                method: "forLead",
                id: lead._id,
            },
        ],
        {
            enabled: lead?._id != null,
            placeholderData: [],
        },
    );
    const data = {
        ...lead,
        tasks: lead.tasks ?? [],
        notes: notes ?? [],
        mails: mails ?? [],
        logs: logs ?? [],
    };
    const activeTasks = lead.tasks.filter(task => task.status === false);
    return (
        <div style={{display: "flex", flexDirection: "column", height: "100%"}}>
            <Checkbox.Group
                options={options.map(option => ({
                    ...option,
                    label: t(option.label),
                }))}
                value={filters}
                onChange={setFilters}
                style={{marginBottom: "1rem"}}
            />
            {activeTasks.length > 0 && <ActiveTasks tasks={activeTasks} lead={lead} />}
            <LeadTimelineInternal lead={data} filters={filters} />
        </div>
    );
});

export const LeadTimeline = TimelineWrapper;
