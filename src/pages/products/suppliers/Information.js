import {Col, Divider, Row, Typography, Space} from "antd";
import {
    LikeOutlined,
    WarningOutlined,
    DislikeOutlined,
    CloseCircleOutlined,
    QuestionCircleOutlined,
} from "@ant-design/icons";
import {Flex} from "../../../styled/flex";
import {CompatiblePictureWall} from "pages/common/PictureWall";
import {EditableFields} from "../../common/EditableFields";
import {BufferedTextArea} from "../../common/BufferedTextArea";
import {Catalogues} from "./Catalogues";
import {memo} from "react";
import {Comments} from "../../common/Comments";
import {useTranslation} from "react-i18next";
import {ContactCards} from "./ContactCards";
import {useDataMutation} from "hooks/useDataMutation";
import {useGlobalState} from "hooks/useGlobalState";
import {useQueryClient} from "react-query";

const {Title} = Typography;

const formItemLayout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 18,
    },
};

const fields = t => [
    {
        label: "products.name",
        type: "text",
        key: "name",
    },
    {
        label: "products.legalName",
        type: "text",
        key: "legalName",
    },
    {
        label: "products.reliability",
        type: "select",
        key: "status",
        options: [
            {
                value: "new",
                label: (
                    <Space>
                        <QuestionCircleOutlined />
                        {t("products.unknown")}
                    </Space>
                ),
            },
            {
                value: "like",
                label: (
                    <Space>
                        <LikeOutlined />
                        {t("products.good")}
                    </Space>
                ),
            },
            {
                value: "average",
                label: (
                    <Space>
                        <WarningOutlined />
                        {t("products.someProblems")}
                    </Space>
                ),
            },
            {
                value: "dislike",
                label: (
                    <Space>
                        <DislikeOutlined />
                        {t("products.bad")}
                    </Space>
                ),
            },
            {
                value: "blacklisted",
                label: (
                    <Space>
                        <CloseCircleOutlined />
                        {t("products.blacklisted")}
                    </Space>
                ),
            },
        ],
    },
    {
        label: "products.pricing",
        type: "pricing",
        key: "pricing",
        allowHalf: true,
    },
    {
        label: "quotations.shipping",
        type: "money",
        key: "shipping",
        defaultValue: 0,
    },
    {
        label: "products.interest",
        type: "number",
        key: "interest",
        renderPreview: value => (typeof value === "number" ? value * 100 : "By category"),
        beforeSave: value => (typeof value === "number" ? Math.round(value) / 100 : null),
        valueModifier: value => (value == null ? value : value * 100),
        params: {
            min: 0,
            step: 10,
            max: 100,
        },
    },
    {
        label: "products.invoiceStatus",
        type: "text",
        key: "fapiao",
    },
];

export const SupplierInformation = memo(({data, onDataChange}) => {
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const [user] = useGlobalState("user");

    const {mutate: appendContact} = useDataMutation("/suppliers/addContact", {
        onSuccess: () => {
            queryClient.invalidateQueries("suppliers");
        },
    });
    const {mutate: updateContact} = useDataMutation("/suppliers/changeContact", {
        onSuccess: () => {
            queryClient.invalidateQueries("suppliers");
        },
    });
    const {mutate: deleteContact} = useDataMutation("/suppliers/deleteContact", {
        onSuccess: () => {
            queryClient.invalidateQueries("suppliers");
        },
    });
    return (
        <Row gutter={[48, 24]}>
            <Col span={24}>
                <Flex justifyBetween alignCenter>
                    <Title level={3}>{data.name}</Title>
                    <CompatiblePictureWall
                        imageHeight="9rem"
                        uploadWidth="9rem"
                        uploadHeight="9rem"
                        files={data.photos ?? []}
                        onChange={photos => onDataChange("photos", photos)}
                        max={1}
                    />
                </Flex>
                <Divider />
                <EditableFields
                    {...formItemLayout}
                    labelAlign="left"
                    columns={fields(t).map(field => ({
                        ...field,
                        label: t(field.label),
                    }))}
                    onChange={(key, value) => {
                        onDataChange(key, value);
                    }}
                    data={data}
                />
            </Col>
            {console.log("data supplier info:", data)}
            <Col span={12}>
                <Title level={3}>{t("products.showRoom")}</Title>
                <ContactCards
                    canAdd={user?.access?.products?.canEditSuppliers}
                    contacts={data.showrooms ?? []}
                    onAppendContact={contact => appendContact({supplierId: data._id, contact, type: "showrooms"})}
                    onUpdateContact={(contact, key, val) => updateContact({supplierId: data._id, contactId: contact._id, key, val, type: "showrooms"})}
                    onRemoveContact={contact => deleteContact({supplierId: data._id, contactId: contact._id, type: "showrooms"})}
                />
            </Col>
            <Col span={12}>
                <Title level={3}>{t("products.factory")}</Title>
                <ContactCards
                    canAdd={user?.access?.products?.canEditSuppliers}
                    contacts={data.factories ?? []}
                    onAppendContact={contact => appendContact({supplierId: data._id, contact, type: "factories"})}
                    onUpdateContact={(contact, key, val) => updateContact({supplierId: data._id, contactId: contact._id, key, val, type: "factories"})}
                    onRemoveContact={contact => deleteContact({supplierId: data._id, contactId: contact._id, type: "factories"})}
                />
            </Col>
            <Col span={24} style={{margin: "1rem 0"}}>
                <Divider />
                <BufferedTextArea
                    placeholder={t("products.someCommentsAboutTheSupplier")}
                    autoSize={{minRows: 2}}
                    value={data.description}
                    onChange={value => onDataChange("description", value)}
                />
            </Col>
            <Col span={24}>
                <Title level={3}>{t("products.catalogues")}</Title>
                <Catalogues
                    data={data.catalogues}
                    onUpdate={catalogues => {
                        console.log("data update", catalogues);
                        onDataChange("catalogues", catalogues);
                    }}
                />
            </Col>
            <Col span={24}>
                <Title level={3}>{t("products.comments")}</Title>
                <Comments id={`supplier-${data._id}`} displayTotalAmount={true} />
            </Col>
        </Row>
    );
});
