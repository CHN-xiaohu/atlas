import {memo, useState} from "react";
import {Tooltip} from "antd";
import {FormOutlined} from "@ant-design/icons";
import {useGlobalState} from "hooks/useGlobalState";
import {useTranslation} from "react-i18next";
import {EditQuotationModal} from "../../quotationItems/EditQuotationModal";
import {InlineButton} from "pages/common/InlineButton";


export const useCanShowEdit = () => {
    const [user] = useGlobalState("user");
    return user?.access?.products?.canEditQuotations;
}

export const Edit = memo(({quotation}) => {
    const {t} = useTranslation();
    const [editQuotationModalVisible, setEditQuotationModalVisible] = useState(false);

    const onShowEditQuotationModal = () => {
        setEditQuotationModalVisible(true);
    };

    const onCloseEditQuotationModal = () => {
        setEditQuotationModalVisible(false);
    };

    return (
        <>
            <Tooltip title={t("leads.edit")}>
                <InlineButton icon={<FormOutlined />} onClick={onShowEditQuotationModal} />
            </Tooltip>
            {
                editQuotationModalVisible &&
                <EditQuotationModal quotation={quotation} onClose={onCloseEditQuotationModal} visible={editQuotationModalVisible} />
            }
        </>
    )
})
