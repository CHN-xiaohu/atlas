import {memo, useEffect, useRef} from "react";
import {EmailEditor, exportHtml, loadDesign, setMergeTags} from "./common/EmailEditor";
import {CopyOutlined, DeleteOutlined, DoubleRightOutlined, SaveOutlined, SwapOutlined} from "@ant-design/icons";
import {Button, Col, Row, Select, message, Divider, Radio, Typography, Modal, Input, Form, Checkbox} from "antd";
import {TagManager} from "./editor/TagManager";
import {files} from "../data/files";
import {useImmer} from "../hooks/useImmer";
import {useQuery, useQueryClient} from "react-query";
import {useDataMutation} from "../hooks/useDataMutation";
import {useTranslation} from "react-i18next";
import {LimitedView} from "./common/LimitedView";

const {Option, OptGroup} = Select;
const {Title} = Typography;
const RadioGroup = Radio.Group;
const confirm = Modal.confirm;

export const TemplateEditor = memo(() => {
    const editorRef = useRef();
    const queryClient = useQueryClient();
    const {t} = useTranslation();
    const {data: templates, isPlaceholderData: refreshing} = useQuery(["templates"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const {data: pipelines, isPlaceholderData: refreshingPipelines} = useQuery(["pipelines"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });

    const [state, setState] = useImmer({
        activeTemplate: null,
        editorLoaded: false,
        copyConfirmation: false,
        copyTemplateName: "",
    });

    const {mutate: saveTemplate} = useDataMutation("/templates/save", {
        onSuccess: () => {
            queryClient.invalidateQueries("templates");
            message.success(t("pages.saved"));
        },
        onError: () => {
            message.error(t("pages.error"));
        },
    });

    const {mutate: newTemplate} = useDataMutation("/templates/new", {
        onSuccess: () => {
            queryClient.invalidateQueries("templates");
            message.success(t("pages.saved"));
        },
        onError: () => {
            message.error(t("pages.error"));
        },
    });

    const {mutate: deleteTemplate} = useDataMutation("/templates/delete", {
        onSuccess: () => {
            queryClient.invalidateQueries("templates");
            message.success(t("pages.saved"));
        },
        onError: () => {
            message.error(t("pages.error"));
        },
    });

    const {activeTemplate, editorLoaded} = state;

    const updateProp = (prop, value) => {
        if (state.activeTemplate != null) {
            setState(draft => {
                draft.activeTemplate[prop] = value;
            });
        }
    };

    useEffect(() => {
        if (activeTemplate != null) {
            loadDesign(activeTemplate.template);
            const tags = activeTemplate.tags;
            setMergeTags(
                tags.map(tag => {
                    return {
                        name: tag.label,
                        value: `{{${tag.tag}}}`,
                    };
                }),
            );
        }
    }, [activeTemplate]);

    const save = () => {
        exportHtml(async expo => {
            const {design, html} = expo;

            saveTemplate({
                ...activeTemplate,
                template: design,
                html,
            });
        });
    };

    const copy = () => {
        exportHtml(async expo => {
            const {design, html} = expo;
            newTemplate({
                ...activeTemplate,
                template: design,
                html,
                name: state.copyTemplateName,
                _id: undefined,
                published: false,
            });
        });
    };

    const remove = () => {
        confirm({
            title: `${t("pages.areYouSureDeleteThisTemplate")}?`,
            content: t("pages.thisActionCannotBeUndone"),
            okText: t("pages.yes"),
            okType: "danger",
            cancelText: t("pages.cancel"),
            onOk: () => {
                deleteTemplate({_id: activeTemplate._id});
                setState(draft => {
                    draft.activeTemplate = null;
                });
            },
        });
    };

    return (
        <Row type="flex" gutter={{xs: 16, sm: 16, lg: 24, xl: 48, xxl: 72}} id="template-manager">
            <Col xs={24} sm={24} md={24} lg={10} xl={10}>
                <Title level={2}>{t("pages.templateManager")}</Title>
                <Form layout="vertical">
                    <Form.Item>
                        <Select
                            disabled={!editorLoaded || templates.length === 0}
                            loading={!editorLoaded || templates.length === 0}
                            style={{width: "calc(100% - 111px)"}}
                            onChange={id =>
                                setState(draft => {
                                    draft.activeTemplate = templates.find(template => template._id === id);
                                })
                            }
                            value={activeTemplate?._id}
                            placeholder={t("pages.pleaseSelectATemplate")}
                        >
                            {templates
                                .reduce((languages, template) => {
                                    if (!languages.includes(template.language)) {
                                        languages.push(template.language);
                                    }
                                    return languages;
                                }, [])
                                .map(language => (
                                    <OptGroup key={language} label={language}>
                                        {templates
                                            .filter(t => t.language === language)
                                            .sort((a, b) => a.sort - b.sort)
                                            .map(t => {
                                                return (
                                                    <Option key={t._id} value={t._id}>
                                                        {t.name}
                                                    </Option>
                                                );
                                            })}
                                    </OptGroup>
                                ))}
                        </Select>
                        <LimitedView groups={[(g, user) => user?.access?.templates?.canEditTemplates]}>
                            <Button
                                disabled={activeTemplate == null}
                                style={{marginLeft: "5px"}}
                                icon={<SaveOutlined />}
                                type="primary"
                                onClick={save}
                            />
                        </LimitedView>
                        <Button
                            disabled={activeTemplate == null}
                            style={{marginLeft: "5px"}}
                            icon={<CopyOutlined />}
                            onClick={() => {
                                setState(draft => {
                                    draft.copyTemplateName = `${t("pages.copyOf")} ${activeTemplate.name}`;
                                    draft.copyConfirmation = true;
                                });
                            }}
                        />
                        <Modal
                            title={t("pages.pleaseNameNewTemplate")}
                            visible={state.copyConfirmation}
                            onOk={copy}
                            onCancel={() =>
                                setState(draft => {
                                    draft.copyConfirmation = false;
                                })
                            }
                            okText={t("pages.ok")}
                            cancelText={t("pages.cancel")}
                        >
                            <Input
                                disabled={state.copyTemplateName.length === 0}
                                onChange={e =>
                                    setState(draft => {
                                        draft.copyTemplateName = e.target.value;
                                    })
                                }
                                value={state.copyTemplateName}
                            />
                        </Modal>
                        <LimitedView groups={[(g, user) => user?.access?.templates?.canDeleteTemplates]}>
                            <Button
                                disabled={activeTemplate == null}
                                style={{marginLeft: "5px"}}
                                icon={<DeleteOutlined />}
                                onClick={remove}
                                type="danger"
                            />
                        </LimitedView>
                    </Form.Item>
                    <Divider>{t("pages.templateProperties")}</Divider>
                    <Row gutter={24}>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
                            <Form.Item label={t("pages.templateName")}>
                                <Input
                                    disabled={activeTemplate == null}
                                    value={activeTemplate?.name}
                                    onChange={({target}) => updateProp("name", target.value)}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
                            <Form.Item label={t("pages.defaultSubject")}>
                                <Input
                                    disabled={activeTemplate == null}
                                    value={activeTemplate?.subject}
                                    onChange={({target}) => updateProp("subject", target.value)}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
                            <label htmlFor="pipelines">{t("pages.changeStatus")}</label>
                            <Form.Item>
                                <Select
                                    disabled={activeTemplate == null}
                                    style={{width: "100%"}}
                                    onChange={moveTo => updateProp("moveTo", moveTo)}
                                    defaultValue={0}
                                    value={activeTemplate?.moveTo}
                                    loading={refreshingPipelines}
                                >
                                    <Select.Option value={0}>
                                        <SwapOutlined /> {t("pages.dontMove")}
                                    </Select.Option>
                                    {pipelines.map(pipeline => (
                                        <Select.Option key={pipeline.id} value={pipeline.id}>
                                            <DoubleRightOutlined /> {t(pipeline.name)}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
                            <label>{t("pages.attachedFiles")}:</label>
                            <Form.Item>
                                <Select
                                    disabled={activeTemplate == null}
                                    mode="multiple"
                                    loading={refreshing}
                                    style={{width: "100%"}}
                                    placeholder={t("pages.noFilesAttached")}
                                    value={activeTemplate?.files ?? []}
                                    onChange={files => {
                                        updateProp("files", files);
                                    }}
                                >
                                    {files
                                        .filter(file => !(activeTemplate?.files ?? []).includes(file))
                                        .map(file => {
                                            return (
                                                <Option key={file} value={file}>
                                                    {file}
                                                </Option>
                                            );
                                        })}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
                            <label>{t("pages.templateLanguage")}: </label>
                            <Form.Item>
                                <RadioGroup
                                    disabled={activeTemplate == null}
                                    onChange={e => updateProp("language", e.target.value)}
                                    value={activeTemplate?.language}
                                >
                                    <Radio value="English">{t("pages.english")}</Radio>
                                    <Radio value="Russian">{t("pages.russian")}</Radio>
                                </RadioGroup>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={12}>
                            <Form.Item label={t("pages.published")}>
                                <Checkbox
                                    disabled={activeTemplate == null}
                                    checked={activeTemplate?.published}
                                    onChange={({target}) => updateProp("published", target.checked)}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider>{t("pages.fields")}</Divider>
                    <TagManager
                        disabled={activeTemplate == null}
                        update={tags => {
                            updateProp("tags", tags);
                            setMergeTags(
                                tags.map(tag => {
                                    return {
                                        name: tag.label,
                                        value: `{{${tag.tag}}}`,
                                    };
                                }),
                            );
                        }}
                        data={activeTemplate?.tags ?? []}
                    />
                    <LimitedView groups={[(g, user) => user?.access?.templates?.canEditTemplates]}>
                        <Divider />
                        <Form.Item>
                            <Button
                                disabled={activeTemplate == null}
                                icon={<SaveOutlined />}
                                type="primary"
                                size="large"
                                onClick={save}
                            >
                                {t("pages.save")}
                            </Button>
                        </Form.Item>
                    </LimitedView>
                </Form>
            </Col>

            <Col xs={24} sm={24} md={24} lg={14} xl={14}>
                <EmailEditor
                    projectId={1921}
                    id="main-editor"
                    minHeight="90vh"
                    onDesignUpdate={console.log}
                    onLoad={() => {
                        setState(draft => {
                            draft.editorLoaded = true;
                        });
                    }}
                    ref={editorRef}
                />
            </Col>
        </Row>
    );
});
