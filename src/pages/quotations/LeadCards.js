import {memo, useState} from "react";
import {Link} from "react-router-dom";
import {useQuery} from "react-query";
import {Space, Typography, Collapse, Tooltip, Tag, Select, Button} from "antd";
import {DollarCircleFilled, SortAscendingOutlined, SortDescendingOutlined, EyeInvisibleOutlined} from "@ant-design/icons";
import {Flex} from "styled/flex";
import {Dot} from "pages/common/Dot";
import {Wrapper, Line} from "./styles/LeadCards";
import {LeadQuotations} from "./impureUI/LeadQuotations";
import {getCountryCode} from "../../data/countries";
import {FlagMaker} from "../common/EditableFields";
import {color, rateClient, clientColor, smooth, dollars, usd, leadName} from "Helper";
import {Stars} from "pages/common/Stars";
import moment from "moment";
import {useHistory} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useSocketStorage} from "../../hooks/useSocketStorage";
import { UnreadMessagesBadge } from "./modules/NewQuotations/components/quotationItems/Menu/Card";
import {ButtonsMenu} from "pages/common/ButtonsMenu";

const {Text} = Typography;
const {Panel} = Collapse;
const {Option} = Select;

const sortLeads = (asc, key) =>
    ({
        price: (a, b) => {
            const av = a?.price ?? 0;
            const bv = b?.price ?? 0;
            return asc ? av - bv : bv - av;
        },

        status: (a, b) => {
            const av = a?.status?.sort ?? 0;
            const bv = b?.status?.sort ?? 0;
            return asc ? av - bv : bv - av;
        },

        lastCreate: (a, b) => {
            const av = new Date(a?.created_at ?? 0);
            const bv = new Date(b?.created_at ?? 0);
            return asc ? av - bv : bv - av;
        },

        lastUpdate: (a, b) => {
            const av = new Date(a?.updated_at ?? 0);
            const bv = new Date(b?.updated_at ?? 0);
            return asc ? av - bv : bv - av;
        },
    }[key]);

const leadReadStateOptions = [
    {label: "mailbox.all", key: "all" },
    {label: "mailbox.unread", key: "unread", icon: <EyeInvisibleOutlined />},
]

export const LeadCards = memo(({titleColor, title, leads, filters}) => {
    const {data: quotationUnreadCount} = useQuery(
        [
            "comments",
            {
                method: "unreadForQuotations",
                quotationIds: leads?.length > 0 ? leads.map(lead => lead.quotationIds).flat() : [],
            },
        ],
        {
            enabled: leads?.length > 0,
            placeholderData: [],
        },
    );

    const rates = useSocketStorage("forex");
    const forex = usd(rates);

    const {t} = useTranslation();
    const history = useHistory();
    const [activeKey, setActiveKey] = useState([]);
    const [activeReadState, setActiveReadState] = useState("all");
    const [sort, setSort] = useState("lastUpdate");
    const [asc, toggleAsc] = useState(false);

    const preparedLeads = leads
        .map(lead => {
            const unreadCount = lead.quotationIds
                .map(id => quotationUnreadCount[id])
                .reduce((total, count) => total + count, 0);

            return {
                ...lead,
                _meta: {
                    rating: rateClient(lead),
                    unreadCount,
                },
            };
        })
        .filter(lead => activeReadState === "unread" ? lead._meta.unreadCount > 0 : true)
        .sort(sortLeads(asc, sort));

    const handleSortChange = value => {
        setSort(value);
    };

    const handleToggleAsc = () => {
        toggleAsc(value => !value);
    };

    const handleSelectQuotation = _quotationId => {
        history.push("/products");
    };

    return (
        <Wrapper>
            <Flex alignCenter>
                <Dot color={titleColor} />
                <Space align="baseline">
                    <h3 className="title">{title}</h3>
                    <Text>
                        {preparedLeads.length} {t("quotation.clients")}
                    </Text>
                </Space>
                <Space className="sort" align="center">
                    <ButtonsMenu
                        options={leadReadStateOptions}
                        activeKey={activeReadState}
                        onChange={key => setActiveReadState(key)}
                    />
                    <Select className="sort-select" value={sort} onChange={handleSortChange}>
                        <Option value="price">{t("quotation.amount")}</Option>
                        <Option value="status">{t("quotation.status")}</Option>
                        <Option value="lastCreate">{t("quotation.newlyCreated")}</Option>
                        <Option value="lastUpdate">{t("quotation.latestModification")}</Option>
                    </Select>
                    <Button
                        icon={asc ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                        onClick={handleToggleAsc}
                    />
                </Space>
            </Flex>
            <Line color={titleColor} />
            <Collapse className="lead-card" ghost activeKey={activeKey} onChange={setActiveKey}>
                {preparedLeads.map(lead => (
                    <Panel
                        key={lead._id}
                        header={
                            <Flex column>
                                <div className="card-header">
                                    {lead.country && <FlagMaker country={getCountryCode(lead.country)} />}

                                    {lead._meta.rating > 0 && (
                                        <div className="lead-stars-wrapper">
                                            <Stars count={lead._meta.rating} />
                                        </div>
                                    )}

                                    <div className="lead-name-wrapper">
                                        <Tooltip
                                            title={
                                                <span>
                                                    {t("leads.createdAt")}
                                                    {moment(lead.created_at).format("HH:mm DD MMMM")}
                                                </span>
                                            }
                                        >
                                            <Link
                                                className="lead-name"
                                                style={{color: clientColor(lead)}}
                                                to={`/leads/${lead._id}`}
                                            >
                                                {leadName(lead)}
                                            </Link>
                                        </Tooltip>
                                    </div>

                                    <Tag
                                        className="status-tag"
                                        color={color(lead.status?.color, lead.status?.colorLevel)}
                                    >
                                        {t(lead.status?.name)}
                                    </Tag>
                                </div>

                                <div className="card-footer">
                                    <Space align="center">
                                        {lead.price != null && lead.price > 0 && (
                                            <Tooltip title={dollars(lead.price)}>
                                                <div>{dollars(smooth(lead.price / forex), "$")}</div>
                                            </Tooltip>
                                        )}

                                        {lead.paidDeposit && (
                                            <Tooltip title={t("leads.paidTheDeposit")}>
                                                <DollarCircleFilled style={{color: color("gold"), fontSize: "1.6em"}} />
                                            </Tooltip>
                                        )}

                                        {lead._meta.unreadCount > 0 && (
                                            <div className="card-unread">
                                                <UnreadMessagesBadge count={`${lead._meta.unreadCount} ${t("quotation.unread")}`} />
                                            </div>
                                        )}
                                    </Space>

                                    <div className="card-quotation-count">
                                        {lead.quotationCount}
                                        {t("quotation.quotations")}
                                    </div>
                                </div>
                            </Flex>
                        }
                    >
                        <LeadQuotations
                            active={activeKey.includes(lead._id)}
                            lead={lead}
                            filters={filters}
                            quotationUnreadCount={quotationUnreadCount}
                            forex={forex}
                            sort={sort}
                            asc={asc}
                            onSelectQuotation={handleSelectQuotation}
                        />
                    </Panel>
                ))}
            </Collapse>
        </Wrapper>
    );
});
