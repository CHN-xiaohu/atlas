import {memo} from "react";
import {Col, Row, Divider} from "antd";
import {LeadMenu} from "./lead/LeadMenu";
import {LeadInfo} from "./lead/LeadInfo";
import {InfoBoard} from "./lead/InfoBoard";
import styled from "styled-components";
import {Redirect, Route, Switch} from "react-router-dom";
import {Spinner} from "../common/Spinner";
import {useLocalStorage} from "@rehooks/local-storage";
import {useDataMutation} from "../../hooks/useDataMutation";
import {useQuery, useQueryClient} from "react-query";
import {NotFound} from "../../errors/NotFound";
import {ContactsControlWithCallBackend as ContactsControl} from "pages/leads/contacts/impureUI/ContactsControlWithCallBackend";
import {useGlobalState} from "hooks/useGlobalState";

const StyledRow = styled(Row)`
    height: calc(91.5vh - 230px);
    width: 100%;
`;

const ScrollableColumn = styled(Col)`
    max-height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
`;

const FixedColumn = styled(Col)`
    height: 100%;
    overflow: auto;
`;

export const Lead = memo(({id}) => {
    const [user] = useGlobalState("user");
    const queryClient = useQueryClient();
    const {mutate: changeLeadInfo} = useDataMutation("/leads/change", {
        onSuccess: () => {
            queryClient.invalidateQueries("leads");
        },
    });

    const {data: lead, isLoading} = useQuery(
        [
            "leads",
            {
                method: "byId",
                _id: id,
            },
        ],
        {
            enabled: id != null,
        },
    );
    const {data: tasks} = useQuery(
        [
            "tasks",
            {
                method: "forLeads",
                leads: [id],
            },
        ],
        {
            enabled: id != null,
            placeholderData: [],
        },
    );
    const [collapsed] = useLocalStorage("lead-info-collapsed", false);
    if (lead == null) {
        if (isLoading) {
            return <Spinner />;
        } else {
            return <NotFound />;
        }
    }
    const data = {
        ...lead,
        tasks,
    };

    return (
        <Switch>
            <Route
                path={[
                    "/leads/:client/timeline",
                    "/leads/:client/stats",
                    "/leads/:client/whatsapp",
                    "/leads/:client/quotations",
                    "/leads/:client/new_quotations",
                    "/leads/:client/purchases",
                    "/leads/:client/_purchases",
                    "/leads/:client/qc",
                ]}
                render={() => {
                    return (
                        <StyledRow justify="flex-end" gutter={36}>
                            <Col span={24}>
                                <LeadMenu client={data} changeLeadInfo={changeLeadInfo} />
                                <Divider />
                            </Col>
                            {collapsed !== true && (
                                <ScrollableColumn xxl={7} xl={8} lg={10}>
                                    <LeadInfo
                                        client={data}
                                        onChange={(key, value) => {
                                            if (lead[key] !== value) {
                                                changeLeadInfo({lead: lead._id, key, value});
                                            }
                                        }}
                                    />
                                    <ContactsControl
                                        lead={lead}
                                        disabled={!user?.access?.leads?.canEditLeads}
                                        canDelete={!!user?.access?.leads?.canEditLeads}
                                        style={{margin: "8px 0"}}
                                        contacts={data.contacts}
                                        fallback={true}
                                    />
                                </ScrollableColumn>
                            )}
                            <FixedColumn {...(!collapsed ? {xxl: 17, xl: 16, lg: 14} : {span: 24})}>
                                <InfoBoard lead={data} />
                            </FixedColumn>
                        </StyledRow>
                    );
                }}
            />
            <Redirect to={`/leads/${data._id}/timeline`} />
        </Switch>
    );
});
