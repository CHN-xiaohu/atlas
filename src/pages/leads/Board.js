import {Col, Row} from "antd";
import {DragDropContext} from "react-beautiful-dnd";
import {memo, useCallback, useMemo} from "react";
import moment from "moment";
import {closestActiveTask} from "./LeadCard";
import {useQuery, useQueryClient} from "react-query";
import {useDataMutation} from "../../hooks/useDataMutation";
import ScrollContainer from "react-indiana-drag-scroll";
import {fields as leadFields} from "../../data/leadFields";
import {Spinner} from "../common/Spinner";
import {LeadColumn} from "./LeadColumn";
import {useTranslation} from "react-i18next";

const onDragEnd = ({draggableId: lead, destination, source}, callback) => {
    if (destination != null) {
        const status = +destination.droppableId;
        const oldStatus = +source.droppableId;
        if (oldStatus !== status) {
            console.log("new status", status, "for", lead);
            typeof callback === "function" && callback(lead, status);
        }
    }
};

const now = moment();

const sortLeadsInColumns = (a, b) => {
    const AisFrozen = a.doNotDisturbTill != null && moment(a.doNotDisturbTill).isAfter(now);
    const BisFrozen = b.doNotDisturbTill != null && moment(b.doNotDisturbTill).isAfter(now);

    if (AisFrozen && !BisFrozen) {
        return 1;
    } else if (!AisFrozen && BisFrozen) {
        return -1;
    }

    const closestA = moment(closestActiveTask(a)).unix();
    const closestB = moment(closestActiveTask(b)).unix();
    if (closestA !== closestB) {
        return closestA - closestB;
    }
    if (a.arrivalDate !== b.arrivalDate) {
        return a.arrivalDate - b.arrivalDate;
    }
    if (a.price !== b.price) {
        return b.price - a.price;
    }
    if (a.russianSpeaking !== b.russianSpeaking) {
        return b.russianSpeaking - a.russianSpeaking;
    }
    return 0;
};

export const Board = memo(({settings}) => {
    const {
        search, //backend
        hideEmptyColumns, // only for frontend
        hideSuspended, //backend
        hideClientsOfDifferentManagers, //backend
        responsible, //backend
        rating, //backend
        presence, //backend
        country, //backend
        manager,
    } = settings;
    const {data: pipelines, isPlaceholderData: pipelinesLoading} = useQuery(
        [
            "pipelines",
            {
                method: "active",
            },
        ],
        {
            placeholderData: [],
            staleTime: 4 * 60 * 60 * 1000,
            cacheTime: 4 * 60 * 60 * 1000,
        },
    );
    const {data: leads, isPlaceholderData: leadsLoading} = useQuery(
        [
            "leads",
            {
                method: "activeLeads",
                search,
                hideSuspended,
                presence,
                country,
                responsible,
                hideClientsOfDifferentManagers,
                rating,
                manager,
            },
        ],
        {
            placeholderData: [],
        },
    );
    const {data: tasks} = useQuery(
        [
            "tasks",
            {
                method: "activeForLeads",
                leads: leads.map(lead => lead._id),
            },
        ],
        {
            placeholderData: [],
            enabled: Array.isArray(leads) && leads.length > 0,
        },
    );
    const {data: managers} = useQuery(
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
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const fields = useMemo(() => leadFields(pipelines ?? [], {}, [], t), [pipelines, t]);
    const {mutate: changeProperty} = useDataMutation("/leads/change", {
        onSuccess: () => {
            queryClient.invalidateQueries("leads");
        },
    });
    const boundChangeLeadStatus = useCallback(
        (lead, status) => {
            changeProperty({lead, key: "status_id", value: status});
        },
        [changeProperty],
    );

    if (pipelinesLoading || leadsLoading) {
        return <Spinner />;
    }
    return (
        <Row type="flex" style={{maxWidth: "100%"}}>
            <Col span={24}>
                <ScrollContainer style={{overflow: "auto"}} ignoreElements=".ant-card">
                    <div style={{whiteSpace: "nowrap"}}>
                        <DragDropContext onDragEnd={r => onDragEnd(r, boundChangeLeadStatus)}>
                            {pipelines.map(pipe => {
                                const localLeads = leads
                                    .filter(lead => lead.status_id === pipe.id)
                                    .map(lead => ({
                                        ...lead,
                                        managers: (lead.managers ?? []).map(m =>
                                            managers.find(({login}) => login === m),
                                        ),
                                        tasks: tasks.filter(task => task.lead === lead._id),
                                    }))
                                    .sort(sortLeadsInColumns);
                                if (hideEmptyColumns === false || localLeads.length > 0) {
                                    return (
                                        <LeadColumn
                                            key={pipe.id}
                                            pipeline={pipe}
                                            leads={localLeads}
                                            leadFields={fields}
                                        />
                                    );
                                }
                                return null;
                            })}
                        </DragDropContext>
                    </div>
                </ScrollContainer>
            </Col>
        </Row>
    );
});
