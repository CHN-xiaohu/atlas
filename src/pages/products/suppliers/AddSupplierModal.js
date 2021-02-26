import {useHistory} from "react-router-dom";
import {memo, useState} from "react";
import {Modal} from "antd";
import {SaveOutlined} from "@ant-design/icons";

import {SupplierInformation} from "./Information";
import {useDataMutation} from "../../../hooks/useDataMutation";
import {useTranslation} from "react-i18next";
import {useQueryClient} from "react-query";

const supplierTemplate = {
    factory: {},
    showroom: {},
    status: "new",
};

export const NewSupplierModal = memo(({onClose, ...params}) => {
    const queryClient = useQueryClient();
    const {mutate: addSupplier} = useDataMutation("/suppliers/new", {
        onSuccess: () => {
            queryClient.invalidateQueries("products");
        },
    });
    const history = useHistory();
    const [data, setData] = useState(supplierTemplate);
    const [loading, setLoading] = useState(false);
    const {t} = useTranslation();
    return (
        <Modal
            destroyOnClose
            title={t("products.addNewSupplier")}
            width={600}
            centered
            maskClosable={false}
            {...params}
            onCancel={onClose}
            onOk={() => {
                setLoading(true);
                addSupplier(data, {
                    onSuccess: newSupplier => {
                        setLoading(false);
                        history.push(`/products/suppliers/${newSupplier._id}`);
                    }
                });

            }}
            okText={t("products.save")}
            cancelText={t("products.cancel")}
            okButtonProps={{
                disabled: data.name == null,
                loading,
                icon: <SaveOutlined />,
            }}
        >
            <SupplierInformation data={data} onDataChange={(key, value) => setData({...data, [key]: value})} />
        </Modal>
    );
});
