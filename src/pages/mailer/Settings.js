import {useTranslation} from "react-i18next";
import {useQuery} from "react-query";
import {validateEmail} from "../../Helper";
import {useDataMutation} from "../../hooks/useDataMutation";
import {Button, Col, Divider, Form, Input, message, Row, Select, Typography, Upload} from "antd";
import {files as contracts} from "../../data/files";
import {LimitedView} from "../common/LimitedView";
import {MailOutlined, FileAddOutlined, UndoOutlined} from "@ant-design/icons";
import {generateHtml} from "../mailbox/Mailer";
import {memo, useState, useEffect, useCallback, useContext} from "react";
import {SettingsDispatcherContext} from "../Mailbox";

const {TextArea} = Input;
const {Title} = Typography;

const fileToBase64 = file =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.slice(reader.result.indexOf(",") + 1));
        reader.onerror = error => reject(error);
    });

export const Settings = memo(({onTemplateUpdate, onSettingsUpdate, template, ...settings}) => {
    const [form] = Form.useForm();
    const {resetSettings} = useContext(SettingsDispatcherContext);
    const {t} = useTranslation();
    const {name, tags: tagTemplates} = template || {};
    const [otherFiles, setOtherFiles] = useState([]);
    const {subject, from, to, files = [], tags} = settings;

    useEffect(() => {
        setOtherFiles(otherFiles =>
            files
                .filter(filename => !contracts.includes(filename))
                .map(filename => otherFiles.find(file => file.name === filename)),
        );
    }, [files]);

    const {data: leads} = useQuery(["leads"], {
        placeholderData: [],
    });

    const emails = leads
        .map(lead => lead.contacts.map(contact => contact.email))
        .flat()
        .filter(mail => validateEmail(mail))
        .map(mail => mail.toLowerCase())
        .slice()
        .sort();
    const {data: templates} = useQuery(
        [
            "templates",
            {
                method: "published",
            },
        ],
        {
            placeholderData: [],
            staleTime: 4 * 60 * 60 * 1000,
            cacheTime: 4 * 60 * 60 * 1000,
        },
    );

    const {data: globusEmails} = useQuery(
        [
            "emails",
            {
                method: "boxes",
            },
        ],
        {
            placeholderData: [],
            staleTime: 4 * 60 * 60 * 1000,
            cacheTime: 4 * 60 * 60 * 1000,
        },
    );

    const {mutate: sendMail} = useDataMutation("/emails/send");

    const [typedValue, setTypedValue] = useState("");
    form.setFieldsValue({name, subject, from, to});
    const handleSend = useCallback(async () => {
        message.loading(t("pages.sendingMessage"), 100);
        const account = globusEmails.find(({name}) => name === from)?.account;
        const attachments = await Promise.all(
            otherFiles.map(async file => {
                console.log("file: ", file);
                const content = await fileToBase64(file);
                return {
                    filename: file.name,
                    content,
                    contentType: file.type,
                    contentDisposition: "attachment",
                    cid: file.uid,
                    encoding: "base64",
                };
            }),
        );

        try {
            sendMail(
                {
                    from,
                    to,
                    data: generateHtml(template, settings),
                    subject,
                    files: files.filter(filename => contracts.includes(filename)),
                    otherFiles: attachments,
                    tags,
                    account,
                    template: template.name,
                    senderName: template.language === "Russian" ? "Компания Глобус" : "The Globus Limited",
                    inReplyTo: settings?.messageId,
                },
                {
                    onSuccess(response) {
                        message.destroy();
                        if (response != null && response.messageId) {
                            message.success(t("pages.messageSent"));
                            resetSettings({visible: true});
                        } else if (response != null && response.error != null) {
                            console.log("failed to send message", response.error);
                            message.error(t("pages.failedToSendTheMessage"));
                        } else {
                            message.info(t("pages.probablyNotSentо"));
                        }
                    },
                    onError(response) {
                        console.log("failed to send message", response?.error);
                        message.error(t("pages.failedToSendTheMessage"));
                    },
                },
            );
        } catch (e) {
            message.destroy();
            message.error(t("pages.error"));
        }
    }, [files, otherFiles, from, to, sendMail, settings, subject, t, tags, template, globusEmails, resetSettings]);

    return (
        <>
            <Title level={2}>{t("pages.settings")}</Title>
            <Form form={form} name="email-form" layout="vertical" onFinish={handleSend}>
                <Row gutter={24} id="template-settings">
                    <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}>
                        <Form.Item
                            name="name"
                            label={t("pages.chooseTheTemplate")}
                            rules={[{required: true, message: "请选择模板"}]}
                        >
                            <Select
                                style={{width: "100%"}}
                                placeholder={t("pages.pleaseChooseTheTemplate")}
                                onChange={e => onTemplateUpdate(templates.find(t => t._id === e))}
                                value={name}
                                showSearch
                                optionFilterProp="children"
                                filterOption
                            >
                                {[...new Set(templates.map(template => template.language))].map(language => {
                                    return (
                                        <Select.OptGroup label={language} key={language}>
                                            {templates
                                                .filter(template => template.language === language)
                                                .map(template => (
                                                    <Select.Option key={template.name} value={template._id}>
                                                        {template.name}
                                                    </Select.Option>
                                                ))}
                                        </Select.OptGroup>
                                    );
                                })}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}>
                        <Form.Item
                            name="subject"
                            label={t("pages.subject")}
                            rules={[{required: true, message: "主题不能为空"}]}
                        >
                            <Input
                                disabled={template == null}
                                value={subject}
                                onChange={({target}) =>
                                    onSettingsUpdate({
                                        ...settings,
                                        subject: target.value,
                                    })
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}>
                        <Form.Item
                            name="from"
                            label={t("mailbox.sender")}
                            rules={[{required: true, message: "请选择发送方"}]}
                        >
                            <Select
                                onSearch={typed => {
                                    setTypedValue(typed);
                                }}
                                optionFilterProp="children"
                                onChange={mail => {
                                    onSettingsUpdate({
                                        ...settings,
                                        from: mail,
                                    });
                                }}
                                placeholder={t("pages.typeEmail")}
                                showSearch
                                value={from}
                                allowClear
                            >
                                {globusEmails.map(({account, name}) => (
                                    <Select.Option key={account} value={name}>
                                        {name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}>
                        <Form.Item
                            name="to"
                            label={t("mailbox.recipient")}
                            rules={[{required: true, message: t("mailbox.recipientCannotBeEmpty")}]}
                        >
                            <Select
                                showArrow={false}
                                onSearch={typed => {
                                    setTypedValue(typed);
                                }}
                                optionFilterProp="children"
                                onChange={mail => {
                                    onSettingsUpdate({
                                        ...settings,
                                        to: mail,
                                    });
                                }}
                                disabled={template == null}
                                placeholder={t("pages.typeEmail")}
                                showSearch
                                value={to}
                                allowClear
                            >
                                {[...new Set(emails)].map(mail => (
                                    <Select.Option key={mail} value={mail}>
                                        {mail}
                                    </Select.Option>
                                ))}
                                {validateEmail(typedValue) && !emails.includes(typedValue) && (
                                    <Select.Option key={typedValue} value={typedValue}>
                                        {typedValue}
                                    </Select.Option>
                                )}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={12} xxl={12}>
                        <Form.Item label={t("pages.attachedFiles")}>
                            <div style={{display: "flex"}}>
                                <Select
                                    mode="multiple"
                                    style={{flex: 1}}
                                    placeholder={t("pages.noFilesAttached")}
                                    value={files}
                                    onChange={files => {
                                        onSettingsUpdate({
                                            ...settings,
                                            files,
                                        });
                                    }}
                                    disabled={template == null}
                                >
                                    {contracts
                                        .filter(file => !files.includes(file))
                                        .map(file => {
                                            return (
                                                <Select.Option key={file} value={file}>
                                                    {file}
                                                </Select.Option>
                                            );
                                        })}
                                </Select>

                                <Upload
                                    multiple
                                    showUploadList={false}
                                    beforeUpload={() => false}
                                    onChange={({file, fileList}) => {
                                        onSettingsUpdate({
                                            ...settings,
                                            files: [...settings.files, file.name],
                                        });
                                        setOtherFiles(fileList.map(file => file.originFileObj));
                                    }}
                                >
                                    <Button type="primary" disabled={template == null} icon={<FileAddOutlined />} />
                                </Upload>
                            </div>
                        </Form.Item>
                    </Col>
                </Row>

                {template != null && tagTemplates.length > 0 ? (
                    <>
                        <Divider>{t("pages.fields")}</Divider>
                        <Row gutter={[24, 24]}>
                            {tagTemplates.map(tag => {
                                const EditField = {TextField: Input, TextArea: TextArea}[tag.type] || Input;
                                const largeSize = tag.type === "TextArea" ? 24 : 12;
                                return (
                                    <Col
                                        key={tag.tag}
                                        xs={24}
                                        sm={24}
                                        md={24}
                                        lg={largeSize}
                                        xl={largeSize}
                                        xxl={largeSize}
                                    >
                                        <EditField
                                            onChange={({target}) => {
                                                onSettingsUpdate({
                                                    ...settings,
                                                    tags: {
                                                        ...settings.tags,
                                                        [tag.tag]: target.value,
                                                    },
                                                });
                                            }}
                                            value={tags[tag.tag]}
                                            rows={2}
                                        />
                                    </Col>
                                );
                            })}
                        </Row>
                    </>
                ) : null}
                <Divider />
                <Form.Item>
                    <LimitedView groups={[(g, user) => user?.access?.mailer?.canSendMessages]}>
                        <Button icon={<MailOutlined />} htmlType="submit" type="primary" size="large">
                            {t("pages.send")}
                        </Button>
                    </LimitedView>
                    <Button
                        style={{marginLeft: 14}}
                        htmlType="button"
                        size="large"
                        icon={<UndoOutlined />}
                        onClick={() => resetSettings({visible: true})}
                    >
                        {t("mailbox.reset")}
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
});
