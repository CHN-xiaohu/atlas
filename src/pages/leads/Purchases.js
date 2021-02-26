import {Checkbox, Col, Row} from "antd";
import {memo, useCallback, useState} from "react";
import {Redirect, Route, Switch} from "react-router-dom";
import moment from "moment";
import {MonthMenu} from "./purchases/MonthMenu";
import {PurchaseList} from "./purchases/PurchaseList";
import {PurchasesResults} from "./purchases/PurchasesResults";
import {rateClient} from "../../Helper";
import {Spinner} from "../common/Spinner";
import {MenuHeader} from "../common/MenuHeader";
import {useQuery} from "react-query";
import {useTranslation} from "react-i18next";

const PurchasesWrapper = memo(({date, settings, showPreliminary}) => {
    const clientsSelector = useCallback(
        (clients, managers, receipts, pipelines) => {
            return clients
                ?.filter(
                    lead =>
                        (showPreliminary || lead.status_id === 142) &&
                        (settings.rating == null || rateClient(lead) >= settings.rating) &&
                        (settings.presence !== "personal" || !lead.online) &&
                        (settings.presence !== "online" || lead.online) &&
                        (settings.country == null ||
                            lead.country === settings.country ||
                            (settings.country === "noCountry" && lead.country == null)),
                )
                .map(lead => ({
                    ...lead,
                    status: pipelines.find(pipe => pipe.id === lead.status_id),
                    receipts: receipts
                        ?.filter(receipt => receipt.lead === lead._id),
                    //purchases: purchases.filter(purchase => lead._id === purchase.lead),
                    managers: Array.isArray(lead.managers)
                        ? lead.managers.map(manager => managers.find(user => user.login === manager) || {})
                        : [],
                }));
        },
        [settings, showPreliminary],
    );
    const {data: pipelines} = useQuery(["pipelines"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const {data: managers} = useQuery(
        [
            "users"
        ],
        {placeholderData: [], staleTime: 4 * 60 * 60 * 1000, cacheTime: 4 * 60 * 60 * 1000},
    );
    const {data: receipts, isLoading: loadingReceipts} = useQuery(
        [
            "receipts",
            {
                method: "clients",
                month: date.toDate(),
            },
        ],
        {
            placeholderData: [],
        },
    );

    const {data: leads} = useQuery(
        [
            "leads",
            {
                method: "byIds",
                ids: [...new Set(receipts.map(({lead}) => lead))]
            }
        ],
        {
            enabled: Array.isArray(receipts) && receipts.length > 0,
            placeholderData: []
        }
    )

    const data = clientsSelector(leads, managers, receipts, pipelines);
    if (!Array.isArray(data)) {
        if (!(!loadingReceipts && receipts.length === 0)) {
            return <Spinner />;
        }
    }
    // const total = data.length;
    // const confirmed = data.filter(lead => lead.confirmedPurchase != null).length;
    // const filled = data.filter(lead => lead.receipts != null && lead.receipts.length > 0).length;
    // const toDo = total - confirmed - (filled - confirmed);
    return (
        <>
            <PurchaseList leads={data} />
            {leads?.length > 0 && <PurchasesResults leads={data} />}
        </>
    );
});

export const Purchases = memo(settings => {
    const [showPreliminary, setShowPreliminary] = useState(true);
    const now = moment();
    const {t} = useTranslation();
    return (
        <Row>
            <Col span={24}>
                <Switch>
                    <Route
                        path="/leads/purchases/:year(\d+)/:month(\d+)"
                        render={({history, match}) => {
                            const year = +match.params.year;
                            const month = +match.params.month - 1;
                            return (
                                <>
                                    <MenuHeader
                                        title={moment({
                                            year,
                                            month,
                                        }).format("MMMM YYYY")}
                                        subTitle={<MonthMenu module="leads/purchases" style={{marginBottom: 0}} />}
                                        onBack={() => history.goBack()}
                                        extra={[
                                            <Checkbox
                                                checked={showPreliminary}
                                                onChange={({target}) => setShowPreliminary(target.checked)}
                                            >
                                                {t("leads.showPreliminary")}
                                            </Checkbox>,
                                        ]}
                                    />
                                    <PurchasesWrapper
                                        settings={settings}
                                        showPreliminary={showPreliminary}
                                        date={moment({year, month})}
                                    />
                                </>
                            );
                        }}
                    />
                    <Redirect to={`/leads/purchases/${now.format("YYYY/MM")}`} />
                </Switch>
            </Col>
        </Row>
    );
});
