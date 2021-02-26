import {memo, useState} from "react";
import {Modal, Button} from "antd";
import styled from "styled-components";
import {fields} from "../../../data/leadFields";
import {useGlobalState} from "../../../hooks/useGlobalState";
import {useDataMutation} from "../../../hooks/useDataMutation";
import {useQueryClient, useQuery} from "react-query";
import {useTranslation} from "react-i18next";
import {StaticContent} from "./StaticContent";

const LeadModal = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
`;

export const SimilarModal = memo(({client, similar, onClose, history, showReadOnly}) => {
    const [user] = useGlobalState("user");
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const {mutate: merge} = useDataMutation("/leads/merge", {
        onSuccess: () => {
            queryClient.invalidateQueries("leads");
        },
    });
    const {data: pipelines} = useQuery(["pipelines"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const {data: users} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const [staticClient, setStaticClient] = useState(client);
    const [staticSimilar, setStaticSimilar] = useState(similar);

    const clientColumns = fields(pipelines, staticClient, users, t).filter(
        field => showReadOnly || (typeof field.readOnly === "function" && !field.readOnly(0, user)) || !field.readOnly,
    );
    const similarColumns = fields(pipelines, staticSimilar, users, t).filter(
        field => showReadOnly || (typeof field.readOnly === "function" && !field.readOnly(0, user)) || !field.readOnly,
    );
    const leadSame = Object.keys(staticClient).filter(v => staticClient[v] === staticSimilar[v]);

    return (
        <Modal
            visible={true}
            width="50vw"
            centered
            onCancel={() => onClose()}
            footer={[
                <Button onClick={() => onClose()}>{t("leads.cancel")}</Button>,
                <Button
                    type="primary"
                    onClick={() => {
                        merge({from: staticSimilar._id, to: staticClient._id});
                        onClose();
                    }}
                >
                    {t("leads.mergedLeads")}
                </Button>,
                <Button
                    type="primary"
                    onClick={() => {
                        history.push(`/leads/${staticSimilar._id}/timeline`);
                        onClose();
                    }}
                >
                    {t("leads.goToSimilarLead")}
                </Button>,
            ]}
        >
            <LeadModal>
                <StaticContent
                    lead={staticClient}
                    columns={clientColumns}
                    leadSame={leadSame}
                    setStatic={setStaticClient}
                />
                <StaticContent
                    lead={staticSimilar}
                    columns={similarColumns}
                    leadSame={leadSame}
                    setStatic={setStaticSimilar}
                />
            </LeadModal>
        </Modal>
    );
});
