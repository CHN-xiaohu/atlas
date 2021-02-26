import { memo } from "react";
import {Col, Row} from "antd";
import {StatisticsControlPanel} from "./statistics/StatisticsControlPanel";
import {Redirect, Route, Switch} from "react-router-dom";
import {SalesManager as SalesManagerStatistics} from "./statistics/tabs/SalesManager";
import {Money as MoneyAnalytics} from "./statistics/tabs/Money";
import {Countries} from "./statistics/tabs/Countries";
import {Applications} from "./statistics/tabs/Applications";

export const Statistics = memo(() => {
    return (
        <Row gutter={[24, 24]}>
            <Switch>
                <Route
                    path={"/stats/:key"}
                    render={() => {
                        return (
                            <>
                                <Col span={24}>
                                    <StatisticsControlPanel />
                                </Col>
                                <Switch>
                                    <Route path={"/stats/kpi"} render={() => <SalesManagerStatistics />} />
                                    <Route path={"/stats/money"} render={() => <MoneyAnalytics />} />
                                    <Route path={"/stats/applications"} render={() => <Applications />} />
                                    <Route path={"/stats/countries"} render={() => <Countries />} />
                                    <Redirect to={"/stats/alena"} />
                                </Switch>
                            </>
                        );
                    }}
                />
                <Redirect to="/stats/kpi" />
            </Switch>
        </Row>
    );
});
