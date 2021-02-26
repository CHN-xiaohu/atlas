import {
    DeleteOutlined,
    PlusOutlined,
    ProjectOutlined,
    CarOutlined,
    TeamOutlined,
    CloudOutlined,
    FolderViewOutlined,
    QuestionCircleOutlined,
    HourglassOutlined,
    UsergroupAddOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    DollarCircleOutlined,
} from "@ant-design/icons";
import {Button, Col, Input, Rate, Select, Space, Switch, Tooltip} from "antd";
import {memo, useState} from "react";
import {useHistory} from "react-router-dom";
import {LeadCreator} from "./LeadCreator";
import {ButtonsMenu} from "../common/ButtonsMenu";
import {color} from "../../Helper";
import {ManagersMenu} from "../common/ManagersMenu";
import {useLocalStorage} from "@rehooks/local-storage";
import {Flex} from "../../styled/flex";
import {MenuHeader} from "../common/MenuHeader";
import {CountrySelector} from "../common/CountrySelector";
import {LimitedView} from "../common/LimitedView";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "../../hooks/useGlobalState";
import {Dot} from "../common/Dot";
const {Search} = Input;

const menuItems = t => {
    return [
        {
            tooltip: t("leads.boardCapital"),
            path: "/leads/board",
            key: "board",
            icon: <ProjectOutlined />,
        },
        {
            tooltip: t("leads.purchases"),
            path: "/leads/purchases",
            key: "purchases",
            icon: <DollarCircleOutlined />,
        },
        {
            tooltip: t("leads.applications"),
            path: "/leads/applications",
            key: "applications",
            disabled: true,
            icon: <UsergroupAddOutlined />,
        },
        {
            tooltip: t("leads.discarded"),
            path: "/leads/discarded",
            key: "discarded",
            icon: <DeleteOutlined />,
            disabled: (g, user) => !user?.access?.leads?.canDiscardLeads,
            hidden: (g, user) => !user?.access?.leads?.canDiscardLeads,
        },
    ];
};

const presenceFilters = t => {
    return [
        {
            key: "all",
            icon: <TeamOutlined />,
            tooltip: t("leads.allClients"),
        },
        {
            key: "personal",
            tooltip: t("leads.personalVisit"),
            icon: <CarOutlined />,
        },
        {
            key: "online",
            tooltip: t("leads.onlineOrder"),
            icon: <CloudOutlined />,
        },
    ];
};

const HelpDesk = memo(() => {
    const {t} = useTranslation();
    return (
        <Tooltip
            placement="bottom"
            title={
                <div>
                    <div>{t("leads.leadNameColor")}:</div>
                    <div>
                        <Dot color={color("blue")} /> {t("leads.personalVisit")}
                    </div>
                    <div>
                        <Dot color={color("green")} /> {t("leads.onlineOrder")}
                    </div>
                    <div>{t("leads.cardBackgroundColor")}:</div>
                    <div>
                        <Dot color={color("blue")} /> {t("leads.suspended")}
                    </div>
                    <div>
                        <Dot color={color("grey")} /> {t("leads.leadLacksInformation")}
                    </div>
                    <div>
                        <Dot color={color("cyan")} /> {t("leads.clientIsInChinaNow")}
                    </div>
                    <div>
                        <Dot color={color("purple")} /> {t("leads.clientHasAlreadyLeftChina")}
                    </div>
                    <div>
                        <Dot color={color("yellow")} /> {t("leads.newLead")}
                    </div>
                    <div>
                        <Dot color={color("white")} /> {t("leads.normalLead")}
                    </div>
                </div>
            }
        >
            <QuestionCircleOutlined />
        </Tooltip>
    );
});

export const LeadsControlPanel = memo(({current, settings, onUpdateSettings}) => {
    const history = useHistory();
    const [user] = useGlobalState("user");
    const [creatingLead, setCreatingLead] = useState(false);
    const [showAdditionalRow, setAdditionalRowVisibility] = useLocalStorage("leads-additional-filters", false);
    const {t} = useTranslation();
    return (
        <MenuHeader
            subTitle={
                <Space size="large">
                    <ButtonsMenu options={menuItems(t)} activeKey={current} />
                    {user?.access?.leads?.canSeeAllLeads && (
                        <ManagersMenu
                            value={settings.responsible ?? null}
                            group={(g, u) => ["project manager", "sales manager"].includes(u.title)}
                            onClick={responsible => onUpdateSettings({...settings, responsible})}
                        />
                    )}
                    <Tooltip title={t("leads.emptyColumns")}>
                        <Switch
                            checked={!settings.hideEmptyColumns}
                            checkedChildren={<FolderViewOutlined />}
                            unCheckedChildren={<FolderViewOutlined />}
                            onClick={value => onUpdateSettings({...settings, hideEmptyColumns: !value})}
                        />
                    </Tooltip>
                    <Tooltip title={t("leads.suspendedLeads")}>
                        <Switch
                            checked={!settings.hideSuspended}
                            checkedChildren={<HourglassOutlined />}
                            unCheckedChildren={<HourglassOutlined />}
                            onClick={value => onUpdateSettings({...settings, hideSuspended: !value})}
                        />
                    </Tooltip>
                    <Button
                        icon={showAdditionalRow ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        danger={!showAdditionalRow && (settings.country != null || settings.rating > 0)}
                        onClick={() => setAdditionalRowVisibility(!showAdditionalRow)}
                    />
                </Space>
            }
            extra={[
                <HelpDesk key="help-desk" />,
                <LimitedView groups={[(g, user) => user?.access?.leads?.canAddLeads]}>
                    <Button key="new-lead" icon={<PlusOutlined />} onClick={() => setCreatingLead(true)}>
                        {t("leads.newLead")}
                    </Button>
                </LimitedView>,
                <Search
                    key="search"
                    defaultValue={settings.search}
                    placeholder={t("leads.inputSearchText")}
                    style={{width: 400}}
                    allowClear
                    onSearch={str => onUpdateSettings({...settings, search: str})}
                />,
            ]}
        >
            <LeadCreator
                visible={creatingLead}
                onClose={() => {
                    setCreatingLead(false);
                }}
                onCreate={lead => {
                    history.push(`/leads/${lead._id}`);
                }}
            />
            {showAdditionalRow && (
                <Col span={24}>
                    <Flex justifyBetween>
                        <Space size="large">
                            <CountrySelector
                                value={settings.country}
                                onChange={country => onUpdateSettings({...settings, country})}
                            />
                            <Select
                                value={settings.rating ?? 0}
                                onChange={rating => onUpdateSettings({...settings, rating})}
                            >
                                <Select.Option value={0}>{t("leads.anyRating")}</Select.Option>
                                <Select.Option value={1}>
                                    <Rate disabled count={3} value={1} />
                                </Select.Option>
                                <Select.Option value={2}>
                                    <Rate disabled count={3} value={2} />
                                </Select.Option>
                                <Select.Option value={3}>
                                    <Rate disabled count={3} value={3} />
                                </Select.Option>
                            </Select>
                            <ButtonsMenu
                                options={presenceFilters(t)}
                                activeKey={settings.presence ?? "all"}
                                onChange={key => onUpdateSettings({...settings, presence: key})}
                            />
                            <LimitedView groups={[(g, user) => user?.access?.leads?.canSeeAllLeads]}>
                                <ManagersMenu
                                    value={settings.manager ?? null}
                                    onClick={manager => onUpdateSettings({...settings, manager})}
                                    group={(g, u) => u.title === "client manager"}
                                />
                            </LimitedView>
                        </Space>
                    </Flex>
                </Col>
            )}
        </MenuHeader>
    );
});
