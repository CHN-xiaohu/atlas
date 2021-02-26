import { memo } from "react";
import {
    ForkOutlined,
    WhatsAppOutlined,
    FileSearchOutlined,
    VerticalRightOutlined,
    VerticalLeftOutlined,
    ShoppingCartOutlined,
    MonitorOutlined,
} from "@ant-design/icons";
import {Row, Button, Space, Col} from "antd";
import {LeadTimeline} from "./modules/LeadTimeline";
import {Route, Switch, Redirect} from "react-router-dom";
import {idRegex} from "../../../Helper";
import {Whatsapp} from "./modules/WhatsApp";
import {useLocalStorage} from "@rehooks/local-storage";
import {NewQuotations} from "../../quotations/modules/NewQuotations";
import {ButtonsMenu} from "../../common/ButtonsMenu";
import {QualityChecks} from "./modules/qc/QualityChecks";
import {useTranslation} from "react-i18next";
import {Purchases as NewPurchases} from "./modules/NewPurchases";
import {useGlobalState} from "../../../hooks/useGlobalState";
import {Flex} from "styled/flex";

export const InfoBoard = memo(({lead}) => {
    const {t} = useTranslation();
    const [user] = useGlobalState('user');
    const userAccess = user?.access;

    const menuOptions = [
        {
            key: "timeline",
            icon: <ForkOutlined />,
            label: "common.Timeline",
            path: () => `/leads/${lead._id}/timeline`,
            hidden: (_group, user) => !user?.access?.leads?.canSeeLeads,
        },
        {
            key: "whatsapp",
            label: "common.WhatsApp",
            icon: <WhatsAppOutlined />,
            path: () => `/leads/${lead._id}/whatsapp`,
            hidden: (_group, user) => !user?.access?.whatsapp?.canSeeChats,
        },
        {
            key: "new_quotations",
            icon: <FileSearchOutlined />,
            label: "quotation.moduleName",
            path: () => `/leads/${lead._id}/new_quotations`,
        },
        {
            key: "_purchases",
            icon: <ShoppingCartOutlined />,
            label: "common.Purchases",
            path: () => `/leads/${lead._id}/_purchases/receipt_summary`,
            hidden: (_group, user) => !user?.access?.leads?.canSeePurchases,
        },
        {
            key: "qc",
            icon: <MonitorOutlined />,
            label: "common.QC",
            path: () => `/leads/${lead._id}/qc`,
            hidden: () => true
        },
    ];

    const [collapsed, setCollapsed] = useLocalStorage("lead-info-collapsed");
    return (
        <Route
            path={`/leads/:id(${idRegex})/:view`}
            render={({match}) => {
                const {view} = match.params;
                return (
                    <Flex style={{height: "100%"}} column>
                        <Row gutter={[24, 24]}>
                            <Col span={24}>
                                <Space>
                                    <Button
                                        onClick={() => setCollapsed(!collapsed)}
                                        type="dashed"
                                        icon={!collapsed ? <VerticalRightOutlined /> : <VerticalLeftOutlined />}
                                    >
                                        {!collapsed ? t("leads.hide") : t("leads.show")} {t("leads.info")}
                                    </Button>
                                    <ButtonsMenu activeKey={view} options={menuOptions} />
                                </Space>
                            </Col>
                        </Row>

                        <div style={{flex: "1", overflowY: "auto", overFlowX: "hidden"}}>
                        <Switch>
                            {userAccess?.leads?.canSeeLeads && (
                                <Route
                                    path={`/leads/:id(${idRegex})/timeline`}
                                    render={() => <LeadTimeline lead={lead} />}
                                />
                            )}
                            {userAccess?.whatsapp?.canSeeChats && (
                                <Route
                                    path={`/leads/:id(${idRegex})/whatsapp`}
                                    render={() => <Whatsapp lead={lead} />}
                                />
                            )}
                            <Route
                                path={`/leads/:id(${idRegex})/new_quotations`}
                                render={() => <NewQuotations lead={lead} />}
                            />
                            {userAccess?.leads?.canSeePurchases && (
                                <Route
                                    path={`/leads/:id(${idRegex})/_purchases`}
                                    render={() => <NewPurchases lead={lead} />}
                                />
                            )}
                            <Route path={`/leads/:id(${idRegex})/qc`} render={() => <QualityChecks {...lead} />} />
                            <Redirect to={`/leads/${lead._id}/timeline`} />
                        </Switch>
                    </div>
                    </Flex>
                );
            }}
        />
    );
});
