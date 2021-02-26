import {memo, useState} from "react";
import {Space, List, Badge, Button, Tooltip} from "antd";
import {LoadingOutlined, EyeOutlined} from "@ant-design/icons";
import {FlagIcon} from "pages/common/Flag";
import {Wrapper} from "./styles/LeadQuotations";
import {QuotationModal} from "pages/products/quotations/QuotationModal";
import {ActiveUsers} from "pages/common/ActiveUsers";
import {Link} from "react-router-dom";
import {Select, DownloadExcel, Share, Delete} from "./modules/NewQuotations/components/global/control";
import {Edit, useCanShowEdit} from "./modules/NewQuotations/components/global/control/Edit";
import {useTranslation} from "react-i18next";
import {UnreadMessagesBadge} from "pages/quotations/modules/NewQuotations/components/quotationItems/Menu/Card";

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

const sortQuotations = (asc, key) =>
    ({
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
    }[key] ?? (() => 0));

const DEFAULT_SORT = "lastUpdate";
const DEFAULT_ASC = false;

export const LeadQuotations = memo(
    ({
        lead,
        quotations,
        users,
        quotationUnreadCount,
        forex,
        onSelectQuotation,
        sort = DEFAULT_SORT,
        asc = DEFAULT_ASC,
        showFlag = false,
    }) => {
        const {t} = useTranslation();
        const leadId = lead._id;
        const [activeQuotationForModal, setActiveQuotationForModal] = useState(null);
        const canShowEdit = useCanShowEdit();

        const preparedQuotations =
            quotations == null
                ? []
                : quotations
                      .map(quotation => {
                          const usersForResponsibles = quotation.responsibles.map(responsible =>
                              users.find(user => user.login === responsible),
                          );
                          return {
                              ...quotation,
                              _meta: {
                                  usersForResponsibles,
                                  unreadCount: quotationUnreadCount[quotation._id],
                              },
                          };
                      })
                      .sort(sortQuotations(asc, sort));

        const handleView = quotation => {
            setActiveQuotationForModal(quotation);
        };

        if (quotations == null) {
            return (
                <div style={{textAlign: "center"}}>
                    <LoadingOutlined />
                </div>
            );
        }

        return (
            <Wrapper>
                <List
                    size="small"
                    dataSource={preparedQuotations}
                    renderItem={quotation => (
                        <List.Item>
                            <div className="quotation">
                                <Space align="center">
                                    <Button onClick={() => handleView(quotation)} icon={<EyeOutlined />} type="text" />
                                    {showFlag && flagIconMap[quotation?.language]}
                                    <Link
                                        className="quotation-link"
                                        to={`/leads/${leadId}/new_quotations/${quotation._id}`}
                                    >
                                        {quotation.name}
                                    </Link>
                                    <Badge
                                        className="quotation-item-count"
                                        count={quotation.quotationItemCount}
                                        showZero
                                    />
                                </Space>

                                <Space className="quotation-tail" align="center">
                                    {quotation._meta.unreadCount > 0 && (
                                        <UnreadMessagesBadge count={`${quotation._meta.unreadCount} ${t("quotation.unread")}`} />
                                    )}
                                    {quotation._meta.usersForResponsibles.length > 0 && (
                                        <ActiveUsers users={quotation._meta.usersForResponsibles} />
                                    )}
                                    <Select quotation={quotation} onSelectQuotation={onSelectQuotation} />
                                    <DownloadExcel quotation={quotation} forex={forex} />
                                    {canShowEdit && <Edit quotation={quotation} />}
                                    <Share quotation={quotation} lead={lead} />
                                    <Delete quotation={quotation} />
                                </Space>
                            </div>
                        </List.Item>
                    )}
                />
                {activeQuotationForModal != null && (
                    <QuotationModal
                        quotation={activeQuotationForModal}
                        visible={activeQuotationForModal != null}
                        onClose={() => setActiveQuotationForModal(null)}
                        headerHasSelectButton={true}
                        canSwitchAllQuotationMode={false}
                    />
                )}
            </Wrapper>
        );
    },
);
