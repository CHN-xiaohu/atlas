import {Form, Input, InputNumber, Modal, Radio} from "antd";
import {memo} from "react";
import {categories} from "../../../../../data/productFields";
import {FlagMaker} from "../../../../common/EditableFields";
import {useImmer} from "../../../../../hooks/useImmer";
import {useTranslation} from "react-i18next";
import {useDataMutation} from "../../../../../hooks/useDataMutation";
import {useQueryClient} from "react-query";

const languageOptions = [
    {
        label: <FlagMaker style={{marginLeft: "5px"}} country="ru" size="lg" />,
        value: "ru",
    },
    {
        label: <FlagMaker style={{marginLeft: "5px"}} country="gb" size="lg" />,
        value: "en",
    },
];

export const AddQuotationModal = memo(({lead, onClose, ...params}) => {
    const queryClient = useQueryClient();
    const [data, setData] = useImmer({
        name: "",
        language: lead.russianSpeaking ? "ru" : "en",
        ...categories.reduce((acc, category) => {
            acc[category.key] = category.defaultInterest ?? 0.3;
            return acc;
        }, {}),
    });
    const {t} = useTranslation();
    const {mutate: addQuotation, isLoading} = useDataMutation("/quotations/add", {
        onSuccess: () => {
            queryClient.invalidateQueries("quotations");
        },
    });
    return (
        <Modal
            title={t("leads.addNewQuotation")}
            width={600}
            maskClosable={false}
            {...params}
            onCancel={onClose}
            onOk={() => {
                addQuotation(
                    {...data, lead},
                    {
                        onSuccess: () => {
                            onClose();
                        },
                    },
                );
            }}
            okText={t("leads.add")}
            okButtonProps={{
                loading: isLoading,
                disabled: isLoading || data.name.length === 0,
            }}
        >
            <Form>
                <Form.Item label={t("leads.name")}>
                    <Input
                        value={data.name}
                        onChange={({target}) =>
                            setData(draft => {
                                draft.name = target.value;
                            })
                        }
                        placeholder={t("leads.summerHouseQuotation")}
                    />
                </Form.Item>
                <Form.Item label={t("leads.language")}>
                    <Radio.Group
                        options={languageOptions}
                        onChange={({target}) =>
                            setData(draft => {
                                draft.language = target.value;
                            })
                        }
                        value={data.language}
                    />
                </Form.Item>
                {categories.map(category => (
                    <Form.Item key={category.key} label={t(category.label)}>
                        <InputNumber
                            min={0}
                            step={10}
                            onChange={interest => {
                                setData(draft => {
                                    draft[category.key] = interest / 100;
                                });
                            }}
                            value={data[category.key] * 100}
                        />
                    </Form.Item>
                ))}
            </Form>
        </Modal>
    );
});
