import {memo, useState} from "react";
import {Modal} from "antd";
import {Content} from "./Content";
import {assoc} from "ramda";
import {useTranslation} from "react-i18next";

export const AddCustomItemModal = memo(({onOk, onCancel}) => {
    const {t} = useTranslation();
    const [isLoading, toggleIsLoading] = useState(false);
    const [quotationItem, setQuotationItem] = useState({
        photos: [],
        interest: 0.3,
    });

    const handleUpdate = ({key, value}) => {
        setQuotationItem(assoc(key, value, quotationItem));
    };

    const handleOk = async () => {
        toggleIsLoading(true);
        await onOk(quotationItem);
        toggleIsLoading(false);
    };

    return (
        <Modal
            centered
            visible={true}
            width="800px"
            title={t("quotation.addCustomItem")}
            okText={t("quotation.addCustomItem")}
            cancelText={t("quotation.cancel")}
            okButtonProps={{disabled: isLoading}}
            onOk={handleOk}
            onCancel={onCancel}
        >
            <Content quotationItem={quotationItem} canOperate={false} onUpdate={handleUpdate} />
        </Modal>
    );
});
