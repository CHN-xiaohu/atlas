import {memo, useState, useCallback} from "react";
import styled from "styled-components";
import {Row, Col} from "antd";
import {Header} from "./Header";
import {Menu} from "./Menu";
import {Content} from "./impureUI/Content";
import {QuotationContext} from "./Context";
import {Flex} from "styled/flex";
import {Comment} from "./Comment";
import {useGlobalState} from "../../../../../../hooks/useGlobalState";
import {CheckCircleOutlined, CloseCircleOutlined, EyeInvisibleOutlined, EyeOutlined} from "@ant-design/icons";
import {ButtonsMenu} from "pages/common/ButtonsMenu";
import {findIndex} from "ramda";

const CommentWrapper = styled.div`
    height: 100%;
`;

const MenuCol = styled(Col)`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const readOptions = [
    {
        key: "unread",
        tooltip: "未读",
        icon: <EyeInvisibleOutlined />,
        hidden: (g, user) => !user?.access?.products?.canSeeQuotations,
    },
    {
        key: "read",
        tooltip: "已读",
        icon: <EyeOutlined />,
        hidden: (g, user) => !user?.access?.products?.canSeeQuotations,
    },
    {
        key: null,
        label: "全部",
        hidden: (g, user) => !user?.access?.products?.canSeeQuotations,
    },
];
const approveOptions = [
    {
        key: "declined",
        tooltip: "已拒绝",
        icon: <CloseCircleOutlined />,
        hidden: (g, user) => !user?.access?.products?.canSeeQuotations,
    },
    {
        key: "approved",
        tooltip: "已接受",
        icon: <CheckCircleOutlined />,
        hidden: (g, user) => !user?.access?.products?.canSeeQuotations,
    },
    {
        key: null,
        label: "全部",
        hidden: (g, user) => !user?.access?.products?.canSeeQuotations,
    },
];

const defaultFunc = () => {};
export const Entry = memo(
    ({
        lead,
        activeQuotation,
        activeQuotationItem = null,
        activeCardId = null,
        quotationItems,
        headerHasSelectButton = true,
        titleIsLink = false,
        onSwitchQuotationItem,
        onSelectQuotation,
        onClickNameLink = defaultFunc,
        onBack,
    }) => {
        const quotationContextValue = {activeQuotation, activeQuotationItem, activeCardId, quotationItems, lead};
        const [user] = useGlobalState("user");
        const [readStatus, setReadStatus] = useGlobalState("readStatus");
        const [approveStatus, setApproveStatus] = useGlobalState("approveStatus");
        const [layoutMode, setLayoutMode] = useState(user?.access?.products?.canSeeComments ? "chat" : "content");

        const {menu, content, chat} = {
            content: {
                menu: {
                    xxl: 8,
                    xl: 11,
                    md: 12,
                },
                chat: {
                    xxl: 0,
                    xl: 0,
                    md: 0,
                },
                content: {
                    xxl: 16,
                    xl: 13,
                    md: 12,
                },
            },
            all: {
                menu: {
                    xxl: 8,
                    xl: 8,
                    md: 8,
                },
                chat: {
                    xxl: 5,
                    xl: 5,
                    md: 8,
                },
                content: {
                    xxl: 11,
                    xl: 11,
                    md: 8,
                },
            },
            chat: {
                menu: {
                    xxl: 8,
                    xl: 12,
                    md: 12,
                },
                chat: {
                    xxl: 16,
                    xl: 12,
                    md: 12,
                },
                content: {
                    xxl: 0,
                    xl: 0,
                    md: 0,
                },
            },
        }[layoutMode] ?? {
            menu: {
                xxl: 8,
                xl: 12,
                md: 12,
            },
            chat: {
                xxl: 0,
                xl: 0,
                md: 0,
            },
            content: {
                xxl: 16,
                xl: 12,
                md: 12,
            },
        };

        const handleDelete = useCallback(({_id}) => {
            if (quotationItems.length <= 1) return;
            const index = findIndex(item => item._id === _id, quotationItems);
            onSwitchQuotationItem(
                index === quotationItems.length - 1
                ? quotationItems[index - 1]._id
                : quotationItems[index + 1]._id
            );
        }, [onSwitchQuotationItem, quotationItems]);

        return (
            <QuotationContext.Provider value={quotationContextValue}>
                <Flex column style={{height: "100%"}}>
                    <Header
                        lead={lead}
                        style={{flexShrink: "0"}}
                        onBack={onBack}
                        layoutMode={layoutMode}
                        onLayoutModeChange={setLayoutMode}
                        onSelectQuotation={onSelectQuotation}
                        headerHasSelectButton={headerHasSelectButton}
                        titleIsLink={titleIsLink}
                    />
                    <Row style={{flex: "1", marginTop: ".3rem", overflow: "hidden"}} gutter={[24, 24]}>
                        <MenuCol {...menu}>
                            <Flex justifyBetween style={{padding: "0 0.3rem"}}>
                                <ButtonsMenu
                                    options={readOptions}
                                    activeKey={readStatus}
                                    onChange={key => {
                                        setReadStatus(key);
                                    }}
                                />
                                <ButtonsMenu
                                    options={approveOptions}
                                    activeKey={approveStatus}
                                    onChange={key => {
                                        setApproveStatus(key);
                                    }}
                                />
                            </Flex>
                            <Menu
                                lead={lead}
                                quotation={activeQuotation}
                                quotationItems={quotationItems}
                                onSelectQuotation={onSelectQuotation}
                                onSwitchQuotationItem={onSwitchQuotationItem}
                            />
                        </MenuCol>
                        <Col style={{height: "100%"}} {...chat}>
                            <CommentWrapper>
                                <Comment />
                            </CommentWrapper>
                        </Col>
                        <Col style={{height: "100%", overflowY: "auto"}} {...content}>
                            <Content
                                quotationItem={activeQuotationItem}
                                onClickNameLink={onClickNameLink}
                                onDelete={handleDelete}
                            />
                        </Col>
                    </Row>
                </Flex>
            </QuotationContext.Provider>
        );
    },
);
