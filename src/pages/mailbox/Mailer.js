import {memo, useContext} from "react";
import {Col, Row, Typography} from "antd";
import {useTranslation} from "react-i18next";
import {Preview} from "../mailer/Preview";
import {Settings} from "../mailer/Settings";
import {SettingsContext, SettingsDispatcherContext} from "../Mailbox";

const {Title} = Typography;

const getDefaultSettings = (template, settings) => {
    if (template != null) {
        return {
            ...settings,
            subject: settings.messageId != null ? settings.subject : template.subject,
            html: template.html,
            files: template.files || [],
            tags: template.tags.reduce((acc, tag) => {
                acc[tag.tag] = tag.default;
                return acc;
            }, {}),
            moveTo: template.moveTo,
        };
    }
};

export const generateHtml = (template, {tags, to}) => {
    if (template == null) {
        return "";
    }
    const templateTags = template.tags || [];
    const rules = {
        TextArea: [[/\n/g, "<br>"]],
    };
    const html = templateTags.reduce((html, tag) => {
        // eslint-disable-next-line immutable/no-let
        let value = tags[tag.tag] || tag.default;
        if (rules[tag.type] != null) {
            rules[tag.type].forEach(rule => {
                value = value.replace(...rule);
            });
        }
        return html.replace(new RegExp(`{{${tag.tag}}}`, "g"), value);
    }, template.html);
    //inserting unsubscribe email
    return html.replace(new RegExp("{{unsubscribe}}", "g"), `https://api.globus.furniture/unsubscribe/${to}`);
};

export const Mailer = memo(() => {
    // const [template, setTemplate] = useState(null);
    // const [settings, setSettings] = useState({
    //     subject: "",
    //     html: "",
    //     files: [],
    // });
    const {settings, template} = useContext(SettingsContext);
    const {setSettings, setTemplate} = useContext(SettingsDispatcherContext);
    const {t} = useTranslation();
    return (
        <Row gutter={{xs: 16, sm: 16, lg: 24, xl: 48, xxl: 48}} style={{marginLeft: 0, marginRight: 0}}>
            <Col xs={24} sm={24} md={24} lg={10} xl={11} xxl={13}>
                <Settings
                    template={template}
                    onTemplateUpdate={template => {
                        setTemplate(template);
                        setSettings({...getDefaultSettings(template, settings), visible: true, files: Array.isArray(template.files) ? [...template.files] : [] });
                    }}
                    onSettingsUpdate={setSettings}
                    {...settings}
                />
            </Col>
            <Col xs={24} sm={24} md={24} lg={13} xl={12} xxl={10}>
                <Title level={2}>{t("pages.previewCapital")}</Title>
                <Preview html={generateHtml(template, settings)} subject={settings.subject} files={settings.files} />
            </Col>
        </Row>
    );
});
