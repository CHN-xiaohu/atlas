import {Divider, Row} from "antd";
import { memo } from "react";
import {Redirect, Route, Switch} from "react-router-dom";
import {Board} from "./leads/Board";
import {LeadsControlPanel as TopPanel} from "./leads/LeadsControlPanel";
import {idRegex} from "../Helper";
import {Discarded} from "./leads/Discarded";
import {Purchases} from "./leads/Purchases";
import {Lead} from "./leads/Lead";
import {Applications} from "./leads/Applications";
import {useGlobalState} from "../hooks/useGlobalState";

export const Leads = memo(() => {
    const [settings, updateSettings] = useGlobalState("leadsSettings");
    return (
        <Row type="flex" style={{height: "100%", flexFlow: "column wrap"}}>
            <Switch>
                <Route path={`/leads/:id(${idRegex.toString()})`} render={({match}) => <Lead id={match.params.id} />} />
                <Route
                    path={["/leads/:view"]}
                    render={({match}) => {
                        const view = match.params.view;
                        return (
                            <>
                                <TopPanel current={view} onUpdateSettings={updateSettings} settings={settings} />
                                <Divider />
                                <Switch>
                                    <Route path="/leads/board" render={() => <Board settings={settings} />} />
                                    <Route path="/leads/applications" render={() => <Applications settings={settings} />} />
                                    <Route
                                        path="/leads/discarded"
                                        render={({history}) => <Discarded history={history} {...settings} />}
                                    />
                                    <Route
                                        path="/leads/purchases"
                                        render={() => <Purchases {...settings} />}
                                    />
                                    <Redirect to="/leads/board" />
                                </Switch>
                            </>
                        );
                    }}
                />
                <Redirect to="/leads/board" />
            </Switch>
        </Row>
    );
});
