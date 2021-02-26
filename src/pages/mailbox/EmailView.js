import {memo, useCallback, useState} from "react";
import {Modal, Space, Empty, Button, Popover, message} from "antd";
import {useQuery, useQueryClient} from "react-query";
import {Flex} from "../../styled/flex";
import {Spinner} from "../common/Spinner";
import {PaperClipOutlined, PlusOutlined, ReadOutlined} from "@ant-design/icons";
import {getReadableFileSizeString, getServerUrl, download, color, leadName} from "../../Helper";
import {useGlobalState} from "hooks/useGlobalState";
import styled from "styled-components";
import {useTranslation} from "react-i18next";
import {LeadCreator} from "../leads/LeadCreator";
import {LeadTag} from "../Mailbox";
import {useHistory} from "react-router-dom";
import {TaskForm} from "pages/leads/lead/modules/timeline/EntityForm";

const ScrollContent = styled.div`
    height: 75vh;
    overflow-y: auto;
`;

const FooterWrapper = styled.div`
    display: flex;
    justify-content: flex-end;
`;

export const EmailView = memo(
    ({visible, account, onClose, isRead, subject, text, attachments, _id, from, pipelines, lead, onIsNotLead}) => {
        const queryClient = useQueryClient();
        const {t} = useTranslation();
        const history = useHistory();
        const [user] = useGlobalState("user");
        const [creatingLead, setCreatingLead] = useState();
        const [taskVisible, setTaskVisible] = useState(false);
        // const content = html || textAsHtml;
        const {
            data: {content},
            isFetching,
        } = useQuery(
            [
                "emails",
                {
                    method: "message",
                    account,
                    textId: text?.id,
                    _id,
                    hasLead: lead != null,
                },
            ],
            {
                placeholderData: {},
                keepPreviousData: false,
            },
        );
        const downloadAttachment = useCallback(
            (event, account, attachmentId, filename) => {
                const link = `${getServerUrl()}/emails/attachment?account=${account}&attachmentId=${attachmentId}&session=${
                    user.session
                }`;
                download(link, filename);
            },
            [user.session],
        );

        const attachmentsNode = attachments?.length > 0 && (
            <>
                {attachments.map(attachment => {
                    return (
                        <Flex justifyBetween key={attachment.cid + attachment.filename + attachment.size}>
                            <div>
                                <Space>
                                    <PaperClipOutlined />
                                    <a
                                        href="#/"
                                        onClick={event =>
                                            downloadAttachment(event, account, attachment.id, attachment.filename)
                                        }
                                    >
                                        {attachment.filename}
                                    </a>
                                </Space>
                            </div>
                            <div>{getReadableFileSizeString(attachment.encodedSize)}</div>
                        </Flex>
                    );
                })}
            </>
        );

        const footer = (
            <FooterWrapper>
                {lead != null ? (
                    <LeadTag
                        onClick={event => {
                            event.stopPropagation();
                            history.push(`/leads/${lead._id}`);
                        }}
                        color={color(pipelines.find(pipe => pipe.id === lead.status_id).color)}
                    >
                        {leadName(lead)}
                    </LeadTag>
                ) : (
                    <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={event => {
                            event.stopPropagation();
                            setCreatingLead(from?.address ?? true);
                        }}
                    >
                        {t("mails.lead")}
                    </Button>
                )}
                {/* <Button size="small" icon={<ContactsOutlined />} style={{backgroundColor: color("orange", 3), color: "#fff", border: "none"}}>
                这不是一个客户
            </Button> */}
                {lead != null && (
                    <Popover
                        title={t("mails.addTask")}
                        content={(
                            <div style={{width: 600}}>
                                <TaskForm lead={lead} onSuccess={() => {
                                    setTaskVisible(false);
                                    message.success(t("mails.taskAddSuccess"));
                                }} />
                            </div>
                        )}
                        visible={taskVisible}
                        trigger="click"
                        onVisibleChange={visible => setTaskVisible(visible)}
                    >
                        <Button size="small" icon={<PlusOutlined />}>
                            {t("mails.task")}
                        </Button>
                    </Popover>
                )}
                {lead == null && !isRead && (
                    <Button size="small" type="primary" icon={<ReadOutlined />} onClick={() => onIsNotLead(_id)}>
                        {t("mails.notALead")}
                    </Button>
                )}
            </FooterWrapper>
        );
        return (
            <>
                <Modal
                    title={subject}
                    footer={footer}
                    placement="right"
                    closable={true}
                    onCancel={() => {
                        onClose();
                        !isRead && queryClient.invalidateQueries("emails");
                    }}
                    visible={visible}
                    width={900}
                    style={{marginTop: -50}}
                >
                    <ScrollContent>
                        {isFetching && (
                            <Flex center justifyAround>
                                <Spinner />
                            </Flex>
                        )}
                        {!isFetching && !content && <Empty />}
                        {!isFetching && content && <div dangerouslySetInnerHTML={{__html: content}} />}
                        {attachmentsNode}
                        {/* {attachments?.length > 0 && (
                        <>
                            <Divider />
                            {attachments.map(attachment => {
                                return (
                                    <Flex justifyBetween key={attachment.cid + attachment.filename + attachment.size}>
                                        <div>
                                            <Space>
                                                <PaperClipOutlined />
                                                <a
                                                    href="#/"
                                                    onClick={event =>
                                                        downloadAttachment(event, account, attachment.id, attachment.filename)
                                                    }
                                                >
                                                    {attachment.filename}
                                                </a>
                                            </Space>
                                        </div>
                                        <div>{getReadableFileSizeString(attachment.encodedSize)}</div>
                                    </Flex>
                                );
                            })}
                        </>
                    )} */}
                    </ScrollContent>
                </Modal>
                <LeadCreator visible={creatingLead} id={creatingLead} onClose={() => setCreatingLead(null)} />
            </>
        );
    },
);
