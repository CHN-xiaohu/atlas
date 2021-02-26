import {memo, useState} from "react";
import {SyncOutlined} from "@ant-design/icons";
import {Button, Col, Row, Select, Typography, message, Form, Input, Space} from "antd";
import {QRCode} from "react-qrcode-logo";
import {genID} from "../Helper";
import {Spinner} from "./common/Spinner";
import {useDataMutation} from "../hooks/useDataMutation";
import {useQuery, useQueryClient} from "react-query";
import {useTranslation} from "react-i18next";
import {LimitedView} from "./common/LimitedView";

const {Paragraph, Title} = Typography;
const {Option} = Select;

const GlobusQRCode = memo(({value}) => {
    const width = 300;
    const logo = "/files/linkedin.webp";
    return <QRCode size={width} logoImage={logo} logoWidth={width * 0.3} ecLevel="H" fgColor="#3975C4" value={value} />;
});

const LinkPreview = memo(({link}) => {
    const url = `https://qr.globus.world/${link.id}`;
    const {t} = useTranslation();
    return (
        <>
            <div className="code">
                <GlobusQRCode value={url} />
            </div>
            <Paragraph>
                {t("pages.theShortLinkIs")}
                <Paragraph
                    style={{display: "inline-block", marginBottom: 0}}
                    copyable={{tooltips: [t("pages.copy"), t("pages.copied")]}}
                >
                    {url}
                </Paragraph>
            </Paragraph>
            <Paragraph>
                {t("pages.thisCodeLeadsTo")}
                <a target="_blank" rel="noopener noreferrer" href={link.link}>
                    {link.link}
                </a>
            </Paragraph>
            <Paragraph>
                {t("pages.views")} {link.views || 0}
            </Paragraph>
        </>
    );
});

const LinksCreator = memo(({QRCodes = []}) => {
    const [id, setId] = useState(genID());
    const [link, setLink] = useState("");
    const [processing, setProcessing] = useState(false);
    const queryClient = useQueryClient();
    const {mutate: addLink} = useDataMutation("/links/add", {
        onSuccess: () => {
            queryClient.invalidateQueries("links");
            message.success(t("users.linkSuccessfullyAdded"));
            setProcessing(false);
        },
    });
    const {t} = useTranslation();
    return (
        <>
            <Title level={2}>{t("pages.newLinkQRCode")}</Title>
            <Form layout="vertical">
                <Form.Item label={t("pages.linkID")}>
                    <Space>
                        <Input
                            value={id}
                            onChange={({target}) => setId(target.value)}
                            addonBefore="https://qr.globus.world/"
                        />
                        <Button icon={<SyncOutlined />} onClick={() => setId(genID())} />
                    </Space>
                </Form.Item>
                <LimitedView groups={[(g, user) => user?.access?.links?.canAddLinks]}>
                    <Form.Item label={t("pages.targetLink")}>
                        <Input value={link} onChange={({target}) => setLink(target.value)} />
                    </Form.Item>
                    <Button
                        loading={processing}
                        disabled={QRCodes.find(code => id === code.id) || link.length === 0 || link.length === 0}
                        size="large"
                        htmlType="button"
                        type="primary"
                        onClick={async () => {
                            setProcessing(true);
                            addLink({id, link});
                        }}
                    >
                        {t("pages.add")}
                    </Button>
                </LimitedView>
            </Form>
        </>
    );
});

const LinksStats = memo(({QRCodes = []}) => {
    const [activeLinkId, setActiveLinkId] = useState();

    const {t} = useTranslation();
    if (!Array.isArray(QRCodes)) {
        return <Spinner />;
    }
    const current = QRCodes.find(code => code.id === activeLinkId);
    return (
        <>
            <Title level={2}>{t("pages.searchStats")}</Title>
            <Form layout="vertical">
                <Form.Item label={t("pages.search")}>
                    <Select
                        id="search"
                        filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        showSearch
                        optionFilterProp="children"
                        style={{width: "100%"}}
                        loading={QRCodes.length === 0}
                        disabled={QRCodes.length === 0}
                        placeholder={t("pages.selectALink")}
                        value={activeLinkId}
                        onChange={id => setActiveLinkId(id)}
                    >
                        {QRCodes.map(QRCode => (
                            <Option key={QRCode.id} value={QRCode.id}>
                                {QRCode.link}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
            {current != null ? <LinkPreview link={current} /> : null}
        </>
    );
});

export const Links = memo(() => {
    const {data: QRCodes} = useQuery(["links"]);
    return (
        <Row type="flex" gutter={{xs: 16, sm: 16, lg: 24, xl: 48, xxl: 72}}>
            <Col xs={24} sm={24} md={24} lg={8} xl={8} xxl={8}>
                <LinksCreator QRCodes={QRCodes} />
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8} xxl={8}>
                <LinksStats QRCodes={QRCodes} />
            </Col>
        </Row>
    );
});
