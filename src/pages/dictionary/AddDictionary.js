import { memo, useState } from "react";
import {Modal, Button, Form, Input} from "antd";
import {useImmer} from "../../hooks/useImmer";
import {PlusOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import moment from "moment";

export const AddDictionary = memo(({dictionary, onAddDictionary}) => {
    const {t} = useTranslation();
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const [data, patchData] = useImmer({
        _id: "123",
        name: "",
        time: moment().toDate(),
        words: [],
    });
    return (
        <>
            <Button type="primary" style={{marginTop: "10px"}} icon={<PlusOutlined />} onClick={() => setVisible(true)}>
                {t("pages.add")}
            </Button>
            <Modal
                closable={false}
                visible={visible}
                okButtonProps={{
                    disabled:
                        data.name === "" ||
                        dictionary.findIndex(dictionary => {
                            return dictionary.name === data.name;
                        }) !== -1,
                }}
                okText={t("pages.ok")}
                cancelText={t("pages.cancel")}
                onOk={() => {
                    onAddDictionary(data);
                    form.resetFields();
                    setVisible(false);
                }}
                onCancel={() => {
                    setVisible(false);
                    form.resetFields();
                }}
            >
                <Form labelCol={{span: 4}} wrapperCol={{span: 24}} form={form}>
                    <Form.Item name={t("pages.name")} label={t("pages.name")} rules={[{required: true}]}>
                        <Input
                            value={data.name}
                            onChange={e =>
                                patchData(draft => {
                                    draft.name = e.target.value;
                                })
                            }
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
});
