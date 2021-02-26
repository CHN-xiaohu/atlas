import {memo, useContext, useRef, useEffect} from "react";
import {Badge} from "antd";
import {PushpinOutlined} from "@ant-design/icons"
import styled from "styled-components";
import {Card as StyledCard} from "./style";
import {QuotationContext} from "../Context";
import {Typography} from "antd";
import {Thumbnail} from "../Comment/Picture";
import {dollars, usd, color} from "Helper";
import {useSocketStorage} from "../../../../../../../hooks/useSocketStorage";
import {MessagePreview} from "./MessagePreview";
import {Flex} from "styled/flex";
import {commentTime} from "../../../../../../chat/MessageComment";
import {useTranslation} from "react-i18next";
import {getGlobalState} from "hooks/useGlobalState";
import {finalPrice as calcFinalPrice} from "pages/leads/lead/modules/NewPurchases/helper"
const {Text} = Typography;

const SiderbarCard = styled(StyledCard)`
    position: relative;
    height: 100px;
    width: 100%;
    display: flex;
    position: relative;
    align-items: center;
    .ant-card-body {
        padding: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: space-between;
    }
    .ant-badge-not-a-wrapper {
        position: absolute;
        right: 5px;
    }
`;

const CustomizationBackground = styled.div`
    position: absolute;
    top: calc(50% - 5px);
    right: 0;
    transform: translate(-5px, -50%) rotate(-25deg);

    color: ${color("blue", 1, 0.5)};
    font-size: 64px;
`;

const ThumbnailContent = styled.div`
    width: 85px;
    height: 85px;
    margin-left: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const UnreadMessagesBadge = styled(Badge)`
    .ant-badge-count {
        background-color: ${color("green")};
    }
`;

export const QuestionCard = memo(({theLastOneComment, leadId, onSwitch, unreadCount, scrollToViewportByRef}) => {
    const sidebarCardRef = useRef();
    const text = getGlobalState("chatWindow-inputState")[leadId];
    const {activeCardId} = useContext(QuotationContext);
    const {t} = useTranslation();
    const isActive = activeCardId === leadId;

    useEffect(() => {
        if (isActive) scrollToViewportByRef(sidebarCardRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div ref={sidebarCardRef}>
            <SiderbarCard
                hoverable
                active={isActive}
                onClick={() => {
                    onSwitch(leadId);
                    scrollToViewportByRef(sidebarCardRef);
                }}
            >
                <svg
                    style={{marginLeft: "5px", width: "85px", height: "85px"}}
                    t="1610441835263"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    pId="8705"
                >
                    <path
                        d="M512 981.333333C252.8 981.333333 42.666667 771.2 42.666667 512S252.8 42.666667 512 42.666667s469.333333 210.133333 469.333333 469.333333-210.133333 469.333333-469.333333 469.333333z"
                        fill={color('blue')}
                        pId="8706"
                        dataSpmAnchorId="a313x.7781069.0.i8"
                    ></path>
                    <path
                        d="M509.013333 804.693333a39.68 39.68 0 1 1 0.042667-79.36 39.68 39.68 0 0 1 0 79.36z m161.408-384.170666c-2.304 42.453333-15.317333 75.946667-80.384 141.013333-33.024 32.981333-53.802667 57.728-55.893333 79.445333a33.024 33.024 0 1 1-65.749333-6.485333c4.48-45.738667 38.016-82.688 74.965333-119.637333 59.136-59.136 60.16-77.909333 61.141333-97.792a84.906667 84.906667 0 0 0-24.192-63.36 102.997333 102.997333 0 0 0-74.453333-31.701334h-0.170667a98.688 98.688 0 0 0-98.346666 98.56 32.981333 32.981333 0 1 1-66.005334 0c0-43.946667 17.066667-85.162667 48.042667-116.266666A163.413333 163.413333 0 0 1 505.514667 256a169.386667 169.386667 0 0 1 122.624 52.266667 149.76 149.76 0 0 1 42.24 112.256z"
                        fill="#FFFFFF"
                        pId="8707"
                    ></path>
                </svg>
                <Flex style={{marginTop: "1rem", marginLeft: ".4rem", width: "60%", height: "85px"}} column justifyStart>
                    <Flex justifyBetween alignStart>
                        <Text strong ellipsis>
                            {t("quotation.generalQuestions")}
                        </Text>
                        <Text style={{fontSize: "12px", whiteSpace: "nowrap", opacity: isActive ? "1" : ".7"}}>
                            {commentTime(theLastOneComment?.time, t, true)}
                        </Text>
                    </Flex>
                    <div style={{height: "2rem"}}></div>
                    {text != null && text.length > 0 && !isActive ? (
                        <Flex
                            alignCenter
                            style={{
                                fontSize: "12px",
                                whiteSpace: "nowrap",
                                opacity: isActive ? "1" : ".7",
                            }}
                        >
                            <Text style={{color: !isActive && "red"}}>[{t("quotation.draft")}]</Text>
                            <Text ellipsis>{text}</Text>
                        </Flex>
                    ) : (
                        theLastOneComment != null && <MessagePreview {...theLastOneComment} isActive={isActive} />
                    )}
                </Flex>
                {unreadCount > 0 && <UnreadMessagesBadge count={unreadCount} />}
            </SiderbarCard>
        </div>
    );
});

export const Card = memo(({theLastOneComment, quotationItem, onSwitchQuotationItem, unreadCount, position, scrollToViewportByRef}) => {
    const sidebarCardRef = useRef();
    const {activeQuotationItem} = useContext(QuotationContext);
    //const [inputState] = useGlobalState("chatWindow-inputState");
    const text = getGlobalState("chatWindow-inputState")[quotationItem._id];
    const {t} = useTranslation();
    const rates = useSocketStorage("forex");
    const forex = usd(rates);
    const finalInterest = quotationItem?.interest ?? 0.3;
    const finalPrice = calcFinalPrice(quotationItem?.price ?? 0, finalInterest, quotationItem?.shipping ?? 0);
    const isActive = activeQuotationItem?._id === quotationItem._id;
    const isCustomized = quotationItem?.product == null;
    useEffect(() => {
        setTimeout(() => {
            if (isActive) scrollToViewportByRef(sidebarCardRef);
        }, 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <div ref={sidebarCardRef}>
            <SiderbarCard
                key={quotationItem._id}
                hoverable
                active={activeQuotationItem?._id === quotationItem._id}
                approved={quotationItem?.approved}
                declined={quotationItem?.declined}
                onClick={() => {
                    onSwitchQuotationItem(quotationItem._id);
                    scrollToViewportByRef(sidebarCardRef);
                }}
            >
                {isCustomized && (
                    <CustomizationBackground>
                        <PushpinOutlined />
                    </CustomizationBackground>
                )}
                {Array.isArray(quotationItem.photos) && quotationItem.photos.length > 0 && (
                    <ThumbnailContent>
                        <Thumbnail _id={quotationItem.photos[0]} alt="cover" style={{height: "100%", width: "100%"}} />
                    </ThumbnailContent>
                )}
                <Flex style={{marginLeft: ".4rem", width: "60%", height: "85px"}} column justifyAround>
                    <Flex justifyBetween alignStart>
                        <Text strong ellipsis>
                            #{position + 1} {quotationItem.name}
                        </Text>
                        <Text style={{fontSize: "12px", whiteSpace: "nowrap", opacity: isActive ? "1" : ".7"}}>
                            {commentTime(theLastOneComment?.time, t, true)}
                        </Text>
                    </Flex>
                    <Text>
                        {dollars(Math.ceil(finalPrice / forex), "$")} ({dollars(Math.ceil(finalPrice))})
                    </Text>
                    {text != null && text.length > 0 && !isActive ? (
                        <Flex
                            alignCenter
                            style={{
                                fontSize: "12px",
                                whiteSpace: "nowrap",
                                opacity: isActive ? "1" : ".7",
                            }}
                        >
                            <Text style={{color: !isActive && "red"}}>[{t("quotation.draft")}]</Text>
                            <Text ellipsis>{text}</Text>
                        </Flex>
                    ) : (
                        theLastOneComment != null && <MessagePreview {...theLastOneComment} isActive={isActive} />
                    )}
                </Flex>
                {unreadCount > 0 && <UnreadMessagesBadge count={unreadCount} />}
            </SiderbarCard>
        </div>
    );
});
