import { memo, useState } from "react";
import {Modal, Button, Form, Input} from "antd";
import {useImmer} from "../../hooks/useImmer";
import {PlusOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";

export const AddWord = memo(({words, onAdd}) => {
    const {t} = useTranslation();
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const [data, patchData] = useImmer({
        key: "",
        ru: "",
        en: "",
        zh: "",
    });
    return (
        <>
            <Button type="primary" style={{marginTop: "10px"}} icon={<PlusOutlined />} onClick={() => setVisible(true)}>
                {t("pages.add")}
            </Button>
            <Modal
                destroyOnClose
                closable={false}
                visible={visible}
                footer={[
                    <Button key="cancel" onClick={() => setVisible(false)}>
                        {t("pages.cancel")}
                    </Button>,
                    <Button
                        key="continue"
                        disabled={
                            data.key.length === 0 ||
                            words.findIndex(word => {
                                return data.key.toUpperCase() === word.key.toUpperCase();
                            }) !== -1
                        }
                        onClick={async () => {
                            onAdd(data);
                            form.resetFields();
                        }}
                    >
                        {t("pages.continue")}
                    </Button>,
                    <Button
                        type="primary"
                        key="ok"
                        disabled={
                            data.key.length === 0 ||
                            words.findIndex(word => {
                                return data.key.toUpperCase() === word.key.toUpperCase();
                            }) !== -1
                        }
                        onClick={async () => {
                            onAdd(data);
                            form.resetFields();
                            setVisible(false);
                        }}
                    >
                        {t("pages.ok")}
                    </Button>,
                ]}
            >
                <Form labelCol={{span: 4}} wrapperCol={{span: 24}} form={form}>
                    {Object.keys(data).map((k, i) => {
                        return (
                            <Form.Item key={k} name={k} label={t(`pages.${k}`)} rules={[{required: k === "key"}]}>
                                <Input
                                    value={data[k]}
                                    onChange={e =>
                                        patchData(draft => {
                                            draft[k] = e.target.value;
                                        })
                                    }
                                />
                            </Form.Item>
                        );
                    })}
                </Form>
            </Modal>
        </>
    );
});
