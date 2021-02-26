import {memo, useState, useContext} from "react";
import styled from "styled-components";
import {Tooltip} from "antd";
import {InlineButton} from "pages/common/InlineButton";
import {Space} from "antd";
import {MenuHeader} from "pages/common/MenuHeader";
import {useQuery} from "react-query";
import moment from "moment";
import {useGlobalState} from "hooks/useGlobalState";
import {FormOutlined, ShoppingOutlined, CommentOutlined, BulbOutlined} from "@ant-design/icons";
import {EditQuotationModal} from "./EditQuotationModal";
import {ActiveUsers} from "pages/common/ActiveUsers";
import {QuotationContext} from "./Context";
import {usd} from "Helper";
import {Select, DownloadExcel, Share, Delete, AddToOrder, ResetPosition, useCanResetPosition} from "../global/control";
import {Link} from "react-router-dom";
import {FlagIcon} from "pages/common/Flag";
import {ButtonsMenu} from "../../../../../common/ButtonsMenu";
import {useTranslation} from "react-i18next";
import {makeArray} from "Helper";
import {useSocketStorage} from "../../../../../../hooks/useSocketStorage";

const Wrap = styled.div`
    .ant-descriptions-item-container {
        align-items: center !important;
    }
`;

const flagIconMap = {
    en: (
        <Tooltip title="English">
            <FlagIcon code="gb" />
        </Tooltip>
    ),
    ru: (
        <Tooltip title="Русский">
            <FlagIcon code="ru" />
        </Tooltip>
    ),
};

export const Header = memo(
    ({onBack, layoutMode, onLayoutModeChange, onSelectQuotation, headerHasSelectButton, titleIsLink, lead}) => {
        const {t} = useTranslation();
        const [user] = useGlobalState("user");
        const canAddPurchases = user?.access?.leads?.canAddPurchases;
        const {activeQuotation} = useContext(QuotationContext);
        const [editQuotationModalVisible, setEditQuotationModalVisible] = useState(false);
        const canResetPosition = useCanResetPosition();

        const rates = useSocketStorage("forex");
        const forex = usd(rates);

        const onShowEditQuotationModal = () => {
            setEditQuotationModalVisible(true);
        };

        const onCloseEditQuotationModal = () => {
            setEditQuotationModalVisible(false);
        };

        const {data: users} = useQuery(["users"], {
            placeholderData: [],
            staleTime: 4 * 60 * 60 * 1000,
            cacheTime: 4 * 60 * 60 * 1000,
        });

        const responsibleUsers = activeQuotation?.responsibles.map(responsible => {
            return users.find(user => user.login === responsible);
        });

        const controls = makeArray(
            [
                {
                    value: <ActiveUsers style={{display: "inline-block"}} users={responsibleUsers} />,
                },
                {
                    show: headerHasSelectButton,
                    value: <Select quotation={activeQuotation} onSelectQuotation={onSelectQuotation} />,
                },
                {
                    value: <DownloadExcel quotation={activeQuotation} forex={forex} />,
                },
                {
                    show: canAddPurchases,
                    value: (
                        <Tooltip title={t("leads.edit")}>
                            <InlineButton icon={<FormOutlined />} onClick={onShowEditQuotationModal} />
                        </Tooltip>
                    ),
                },
                {
                    show: true,
                    value: <AddToOrder quotation={activeQuotation} />
                },
                {
                    show: canResetPosition,
                    value: <ResetPosition quotation={activeQuotation} />,
                },
            ],
            [<Share quotation={activeQuotation} lead={lead} />, <Delete quotation={activeQuotation} />],
        );

        const layoutModeOptions = [
            {
                label: "leads.chat",
                key: "chat",
                icon: <CommentOutlined />,
                hidden: (g, user) => !user?.access?.products?.canEditQuotations,
                onClick: onLayoutModeChange,
            },
            {
                label: "leads.quotation",
                key: "content",
                icon: <ShoppingOutlined />,
                onClick: onLayoutModeChange,
            },
            {
                label: "leads.all",
                key: "all",
                icon: <BulbOutlined />,
                hidden: (g, user) => !user?.access?.products?.canEditQuotations,
                onClick: onLayoutModeChange,
            },
        ];

        const titleRendering = (
            <Space>
                {flagIconMap[activeQuotation?.language]}
                {titleIsLink ? (
                    <Link to={`/leads/${activeQuotation.lead}/new_quotations/${activeQuotation._id}`}>
                        {activeQuotation.name}
                    </Link>
                ) : (
                    activeQuotation.name
                )}
                <span style={{fontSize: "1rem"}}>[{moment(activeQuotation.created_at).format("lll")}]</span>
                <ButtonsMenu options={layoutModeOptions} activeKey={layoutMode} />
            </Space>
        );

        return activeQuotation == null ? null : (
            <Wrap>
                <MenuHeader onBack={onBack} title={titleRendering} extra={controls} />
                <EditQuotationModal
                    quotation={activeQuotation}
                    onClose={onCloseEditQuotationModal}
                    visible={editQuotationModalVisible}
                />
            </Wrap>
        );
    },
);
