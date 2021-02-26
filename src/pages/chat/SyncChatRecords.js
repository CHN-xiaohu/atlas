import {memo, useState} from "react";
import {Button, Modal, DatePicker, Typography, Space} from "antd";
import {CloudSyncOutlined} from "@ant-design/icons";
import {useDataMutation} from "hooks/useDataMutation";
import {ManagersMenu} from "pages/common/ManagersMenu";
import {instanceByResponsible} from "./WindowSidebar";
import {compose, assoc} from "ramda";
import {useSocketStorage} from "hooks/useSocketStorage";
import {useTranslation} from "react-i18next";

const {Text} = Typography;
const {RangePicker} = DatePicker;

export const SyncChatRecords = memo(() => {
    const {t} = useTranslation();
    const {syncing} = useSocketStorage("whatsapp-sync-info", {syncing: true});
    const whatsappStatuses = useSocketStorage("whatsapp-statuses");
    const [modalVisible, toggleModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        instances: [],
        startDate: null,
        endDate: null,
    });

    const menuValue = formData.instances
        .map(instance => {
            return Object.keys(instanceByResponsible).find(key => instanceByResponsible[key] === instance);
        })
        .filter(item => item != null);

    const {mutate: syncChatRecords} = useDataMutation("/waChats/syncChatRecords");

    const handleShowModal = () => {
        toggleModalVisible(true);
    };

    const handleCloseModal = () => {
        toggleModalVisible(false);
    };

    const handleMenuChange = keys => {
        const instances = keys.map(key => instanceByResponsible[key]);
        setFormData(data => assoc("instances", instances, data));
    };

    const handleDateChange = (_date, dateString) => {
        setFormData(data => compose(assoc("endDate", dateString[1]), assoc("startDate", dateString[0]))(data));
    };

    const handleSync = () => {
        toggleModalVisible(false);
        syncChatRecords(formData);
    };

    return (
        <>
            {syncing ? (
                <Button disabled loading>
                    {t("chat.synchronizing")}
                </Button>
            ) : (
                <Button onClick={handleShowModal}>
                    <CloudSyncOutlined />
                    {t("chat.syncChatHistory")}
                </Button>
            )}
            {modalVisible && (
                <Modal
                    visible={true}
                    width="300px"
                    title="同步"
                    okText="同步"
                    cancelText="取消"
                    okButtonProps={{disabled: !formData.startDate || !formData.endDate}}
                    onCancel={handleCloseModal}
                    onOk={handleSync}
                >
                    <Space direction="vertical">
                        <div>
                            <Text>选择要同步的账号</Text>
                            <ManagersMenu
                                style={{display: "block"}}
                                value={menuValue}
                                showAllOption={false}
                                group={() => true}
                                filter={user => {
                                    if (!Object.keys(instanceByResponsible).includes(user.login)) return false;

                                    const instance = instanceByResponsible[user.login];
                                    return whatsappStatuses?.[instance] != null;
                                }}
                                onChange={handleMenuChange}
                            />
                        </div>
                        <div>
                            <Text>选择要同步的日期范围</Text>
                            <RangePicker onChange={handleDateChange} />
                        </div>
                    </Space>
                </Modal>
            )}
        </>
    );
});
