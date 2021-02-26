import {memo} from "react";
import {color, dollars, getImageLink, isConfirmed, leadName, usd} from "../../Helper";
import {Avatar, Tooltip, Typography} from "antd";
import {getRating} from "../Schedule";
import styled from "styled-components";
import moment from "moment";
import {useSocketStorage} from "../../hooks/useSocketStorage";
import {useGlobalState} from "../../hooks/useGlobalState";
const {Text} = Typography;
const Badge = styled.div`
    display: grid;
    border: 1.5px ${props => props.borderStyle ?? "solid"} ${props => props.border};
    border-radius: ${props => props.radius};
    background-color: ${props => props.backgroundColor};
    font-size: 10px;
    padding: 0 5px;
    margin-bottom: 2px;
    flex-grow: 1;
    text-align: center;
`;

const AvatarContainer = styled.div`
    margin-right: 3px;
    display: flex;
`;

const EventContainer = styled.div`
    display: flex;
    align-items: center;
    overflow-x: hidden;
`;

const LeadNameText = styled(Text).attrs({
    ellipsis: true,
})`
    font-weight: ${props => (props.important ? "bold" : "normal")};
    color: ${props => props.color} !important;
`;

export const Event = memo(({event, day}) => {
    const [user] = useGlobalState("user");
    const isManager = user.title === "client manager";
    const isFirstDay = day.isSame(moment(event.arrivalDate), "day");
    const isLastDay = day.isSame(moment(event.departureDate), "day");
    const confirmed = isConfirmed(event.status_id);
    const badgeColor = isManager ? color(event.id) : color(event.manager.color || "grey");
    const left = isFirstDay || event.online ? "10px" : "0px";
    const right = isLastDay || event.online ? "10px" : "0px";
    const radius = `${left} ${right} ${right} ${left}`;
    const borderColor = badgeColor;
    const backgroundColor = confirmed ? badgeColor : "inherit";
    const textColor = confirmed ? "white" : badgeColor;
    const rates = useSocketStorage("forex");
    const forex = usd(rates);
    const icon = getRating(event);
    return (
        <EventContainer>
            <AvatarContainer>
                <Tooltip title={event.manager.manager}>
                    <Avatar
                        src={getImageLink(event.manager?.avatar, "avatar_webp", event.manager?.session)}
                        size={16}
                        shape="square"
                    >
                        ?
                    </Avatar>
                </Tooltip>
            </AvatarContainer>
            <Tooltip
                title={
                    <span>
                        {leadName(event)} — {dollars(Math.round(event.price / forex), "$")}
                    </span>
                }
            >
                <Badge
                    border={borderColor}
                    borderStyle={event.online ? "dashed" : "solid"}
                    radius={radius}
                    backgroundColor={backgroundColor}
                >
                    <LeadNameText color={textColor}>
                        {icon} {leadName(event)}
                    </LeadNameText>
                </Badge>
            </Tooltip>
        </EventContainer>
    );
});
