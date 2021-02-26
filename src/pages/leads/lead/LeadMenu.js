import {memo, useState} from "react";
import {DeleteOutlined, ProjectOutlined, WarningOutlined, ExclamationCircleOutlined} from "@ant-design/icons";
import {Popconfirm, Rate, Space, Typography, Button} from "antd";
import {leadName, rateClient} from "../../../Helper";
import {useHistory} from "react-router-dom";
import styled from "styled-components";
import {FlagMaker} from "../../common/EditableFields";
import {getCountryCode} from "../../../data/countries";
import {MenuHeader} from "../../common/MenuHeader";
import {useDataMutation} from "../../../hooks/useDataMutation";
import {LimitedView} from "../../common/LimitedView";
import {useTranslation} from "react-i18next";
import {useQueryClient, useQuery} from "react-query";
import {SimilarModal} from "./SimilarModal";
import {useGlobalState} from "hooks/useGlobalState";

const {Title} = Typography;

const LeadTitle = styled(Title).attrs({
    level: 3,
})`
    margin: 0 !important;
    display: inline-block;
`;

export const LeadMenu = memo(({client, showReadOnly = true, changeLeadInfo}) => {
    const {t} = useTranslation();
    const [visible, setVisible] = useState(false);
    const [user] = useGlobalState("user");
    const queryClient = useQueryClient();
    const history = useHistory();
    const {mutate: removeLead} = useDataMutation("/leads/remove", {
        onSuccess: () => {
            queryClient.invalidateQueries("leads");
        },
    });
    const {mutate: updateLead} = useDataMutation("/leads/change", {
        onSuccess: () => {
            queryClient.invalidateQueries("leads");
        },
    });

    const {data: similar} = useQuery(["leads", {method: "findSame", contacts: client.contacts, _id: client._id}], {
        enabled: user?.access?.leads?.canMergeLeads,
        placeholderData: [],
    });
    return (
        <MenuHeader
            title={
                <Space>
                    {client.country && <FlagMaker country={getCountryCode(client.country)} size="lg" />}
                    <LeadTitle>{leadName(client)}</LeadTitle>
                </Space>
            }
            subTitle={
                <Space>
                    <Rate count={3} value={rateClient(client)} disabled />
                    <LimitedView groups={[(group, user) => user?.access?.leads?.canMergeLeads]}>
                        {similar != null && similar.length !== 0 && (
                            <Button
                                type="primary"
                                icon={<ExclamationCircleOutlined />}
                                onClick={() => {
                                    setVisible(true);
                                }}
                            >
                                {t("leads.thisLeadHasSimilarLeadsPleaseClickToView")}
                            </Button>
                        )}
                        {visible && (
                            <SimilarModal
                                client={client}
                                similar={similar}
                                onClose={() => setVisible(false)}
                                history={history}
                                showReadOnly={showReadOnly}
                            />
                        )}
                    </LimitedView>
                </Space>
            }
            onBack={() => history.goBack()}
            extra={[
                <LimitedView groups={[(g, user) => user?.access?.leads?.canEditLeads]}>
                    {client.status_id === 143 && client.discarded !== true && (
                        <Button
                            icon={<DeleteOutlined />}
                            onClick={() => {
                                updateLead({lead: client._id, key: "discarded", value: true});
                            }}
                        >
                            {t("leads.discard")}
                        </Button>
                    )}
                </LimitedView>,
                <LimitedView groups={[(g, user) => user?.access?.leads?.canDeleteLeads]}>
                    <Popconfirm
                        okText={t("leads.ok")}
                        cancelText={t("leads.cancel")}
                        title={`${t("leads.areYouSure")}?`}
                        onConfirm={() => {
                            removeLead({_id: client._id});
                            history.push("/leads");
                        }}
                    >
                        <Button danger type="primary" icon={<DeleteOutlined />}>
                            {t("leads.removeLead")}
                        </Button>
                    </Popconfirm>
                </LimitedView>,
                client.status_id === 20674270 && (
                    <LimitedView groups={[(g, user) => user?.access?.leads?.canDeleteLeads]}>
                        <Popconfirm
                            key="spam"
                            okText={t("leads.ok")}
                            cancelText={t("leads.cancel")}
                            title={`${t("leads.areYouSureThisLeadIsSpam")}?`}
                            onConfirm={() => {
                                removeLead({_id: client._id});
                                history.push("/leads");
                            }}
                        >
                            <Button icon={<WarningOutlined />}>{t("leads.spam")}</Button>
                        </Popconfirm>
                    </LimitedView>
                ),
                <Button icon={<ProjectOutlined />} onClick={() => history.push("/leads/board")}>
                    {t("leads.backToBoard")}
                </Button>,
            ].filter(el => el != null && el !== false)}
        />
    );
});
