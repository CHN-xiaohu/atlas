import {memo, useMemo} from "react";
import {useQuery} from "react-query";
import {FlagMaker} from "pages/common/EditableFields";
import {Modal, Form, Radio, Input, InputNumber, Checkbox, Alert, Select} from "antd";
import {categories} from "data/productFields";
import {useTranslation} from "react-i18next";
import {useInnerState} from "hooks/useInnerState";
import {ManagersMenu} from "pages/common/ManagersMenu";
import {leadName} from "Helper";
import {assoc} from "ramda";

const {Option} = Select;

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

export const QuotationModal = memo(
    ({title, canEditResponsibles, author, formData, onConfirm, onClose, leadSelectable = false, ...modalParams}) => {
        const {t} = useTranslation();
        const preparedFormData = useMemo(() =>
            categories.reduce((data, category) =>
                data[category.key] == null
                ? {...data, [category.key]: category.defaultInterest ?? 0.3}
                : data
            , {...formData})
        , [formData]);
        const [innerFormData, setInnerFormData] = useInnerState(preparedFormData);

        const {data: leadSelectOptions} = useQuery(
            [
                "leads",
                {
                    method: "activeLeads",
                },
            ],
            {
                enabled: leadSelectable,
                placeholderData: [],
            },
        );

        const setInnerFormDataItem = (key, val) => {
            setInnerFormData(innerFormData => assoc(key, val, innerFormData));
        };

        const onOk = () => {
            onConfirm(innerFormData);
        };

        const okButtonDisabled = useMemo(() =>
            ["lead", "name", "language", "responsibles", "preliminary"]
            .concat(categories.map(category => category.key))
            .map(field => innerFormData[field] != null && innerFormData[field] !== "")
            .includes(false)
        , [innerFormData]);

        return (
            <Modal
                title={title}
                width={600}
                maskClosable={false}
                okText={t("leads.add")}
                cancelText={t("leads.cancel")}
                // okButtonProps={{
                //     loading: isLoading,
                //     disabled: isLoading || data.name.length === 0,
                // }}
                onOk={onOk}
                onCancel={onClose}
                okButtonProps={{disabled: okButtonDisabled}}
                {...modalParams}
            >
                <Form>
                    {leadSelectable && (
                        <Form.Item label={t("products.lead")}>
                            <Select
                                showSearch
                                placeholder={t("products.selectLead")}
                                optionFilterProp="children"
                                onChange={value => {
                                    setInnerFormDataItem("lead", value);
                                }}
                            >
                                {leadSelectOptions.map(lead => (
                                    <Option key={lead._id} value={lead._id}>
                                        {leadName(lead)}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}
                    <Form.Item label={t("leads.name")}>
                        <Input
                            value={innerFormData.name}
                            onChange={({target}) => {
                                setInnerFormDataItem("name", target.value);
                            }}
                            placeholder={t("leads.summerHouseQuotation")}
                        />
                    </Form.Item>
                    <Form.Item label={t("leads.language")}>
                        <Radio.Group
                            value={innerFormData.language}
                            onChange={({target}) => {
                                setInnerFormDataItem("language", target.value);
                            }}
                            options={languageOptions}
                        />
                    </Form.Item>
                    <Form.Item label={t("leads.responsibleManager")}>
                        <ManagersMenu
                            disabled={!canEditResponsibles}
                            value={innerFormData.responsibles ?? []}
                            onChange={responsibles => {
                                setInnerFormDataItem("responsibles", responsibles);
                            }}
                            showAllOption={false}
                            showBanned={[author]}
                            group={(group, user) =>
                                ["sales manager", "product manager", "client manager", "project manager"].includes(
                                    user.title,
                                ) || author === user.login
                            }
                        />
                    </Form.Item>
                    <Form.Item label={t("leads.preliminary")}>
                        <Checkbox
                            checked={innerFormData.preliminary}
                            onChange={e => {
                                setInnerFormDataItem("preliminary", e.target.checked);
                            }}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Alert
                            message={t("leads.allEditsHereWillNotAffectTheDataOfPreviouslyAddedProducts")}
                            type="info"
                        />
                    </Form.Item>
                    {categories.map(category => (
                        <Form.Item key={category.key} label={t(category.label)}>
                            <InputNumber
                                min={0}
                                step={10}
                                onChange={interest => setInnerFormDataItem(category.key, interest / 100)}
                                value={(innerFormData[category.key] ?? 0) * 100}
                            />
                        </Form.Item>
                    ))}
                </Form>
            </Modal>
        );
    },
);
