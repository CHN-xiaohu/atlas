import {memo, useState} from "react";
import {Space, Button, Input} from "antd";
import {PlusOutlined, TeamOutlined, CarOutlined, CloudOutlined} from "@ant-design/icons";
import {ButtonsMenu} from "pages/common/ButtonsMenu";
import {ManagersMenu} from "pages/common/ManagersMenu";
import {AddQuotationModal} from "pages/quotations/modules/NewQuotations/components/quotations/AddQuotationModal";
import {useTranslation} from "react-i18next";
import {MenuHeader} from "../common/MenuHeader";

const {Search} = Input;

const presenceFilters = t => {
    return [
        {
            key: "personal",
            icon: <CarOutlined />,
            tooltip: t("leads.personalVisit"),
        },
        {
            key: "online",
            icon: <CloudOutlined />,
            tooltip: t("leads.onlineOrder"),
        },
        {
            key: null,
            icon: <TeamOutlined />,
            tooltip: t("leads.allClients"),
        },
    ];
};

export const Header = memo(({filters, updateFilter, lead = null, filterPresence = true}) => {
    const {t} = useTranslation();
    const [addModalVisible, toggleAddModalVisible] = useState(false);

    const handleTimeClick = key => {
        updateFilter("time", filters.time === key ? null : key);
    };

    const handleResponsibleClick = responsible => {
        updateFilter("responsible", responsible);
    };

    const handlePresenceChange = key => {
        updateFilter("presence", key);
    };

    const handleSearch = search => {
        updateFilter("search", search);
    };

    const handleShowAddModal = () => {
        toggleAddModalVisible(true);
    };

    const handleCloseAddModal = () => {
        toggleAddModalVisible(false);
    };

    const timeOptions = [
        {
            key: "lastMonth",
            label: "common.time.lastMonth",
            onClick: handleTimeClick,
        },

        {
            key: "lastWeek",
            label: "common.time.lastWeek",
            onClick: handleTimeClick,
        },

        {
            key: "yesterday",
            label: "common.time.yesterday",
            onClick: handleTimeClick,
        },

        {
            key: null,
            label: "common.all",
            onClick: handleTimeClick,
        },
    ];

    return (
        <>
            <MenuHeader
                subTitle={
                    <Space style={{marginRight: "8px"}} align="center">
                        <ButtonsMenu activeKey={filters.time} options={timeOptions} />

                        <ManagersMenu
                            value={filters.responsible}
                            onClick={handleResponsibleClick}
                            showAllOption={true}
                            group={(group, user) =>
                                ["sales manager", "product manager", "client manager", "project manager"].includes(
                                    user.title,
                                )
                            }
                        />

                        {filterPresence && (
                            <ButtonsMenu
                                options={presenceFilters(t)}
                                activeKey={filters.presence}
                                onChange={handlePresenceChange}
                            />
                        )}
                    </Space>
                }
                extra={
                    <Space align="center">
                        <Button icon={<PlusOutlined />} onClick={handleShowAddModal}>
                            {t("quotation.addQuotation")}
                        </Button>

                        <Search allowClear placeholder={t("quotation.nameOfQuotation")} onSearch={handleSearch} />
                    </Space>
                }
            />
            {addModalVisible && (
                <AddQuotationModal lead={lead} visible={addModalVisible} onClose={handleCloseAddModal} />
            )}
        </>
    );
});
