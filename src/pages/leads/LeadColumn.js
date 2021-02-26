import {memo, useCallback} from "react";
import {Dot} from "../common/Dot";
import {useSocketStorage} from "../../hooks/useSocketStorage";
import {Flex} from "../../styled/flex";
import {LeadCard as BoardCard} from "./LeadCard";
import {useTranslation} from "react-i18next";
import {Typography, List, Tooltip, Divider} from "antd";
import styled from "styled-components";
import {Droppable} from "react-beautiful-dnd"
import {smooth, usd, dollars, color} from "../../Helper"

const {Text} = Typography;

const DroppableContainer = styled.div`
    min-height: 70vh;
`;


export const Line = styled(Divider)`
    margin: 10px 0 0 0 !important;
    border-top: 1px solid ${props => props.color} !important;
`;

export const Column = styled.div`
    display: inline-flex;
    justify-content: flex-start;
    flex-direction: column;
    width: 400px;
    margin-right: 30px;
    padding: 0 5px;
    :last-of-type {
        margin-right: 0;s
    }
`;

export const LeadColumn = memo(({pipeline, leads, leadFields}) => {
    const {t} = useTranslation();
    const rates = useSocketStorage("forex");
    const forex = usd(rates);
    const cost = smooth(leads.filter(l => typeof l.price === "number").reduce((s, lead) => s + lead.price, 0));
    const renderCardFn = useCallback((lead, index) => <BoardCard fields={leadFields} lead={lead} index={index} />, [leadFields]);
    const droppableBodyFunction = useCallback(
        droppable => (
            <DroppableContainer ref={droppable.innerRef} {...droppable.droppableProps}>
                {droppable.placeholder}
                <List dataSource={leads} renderItem={renderCardFn} />
            </DroppableContainer>
        ),
        [leads, renderCardFn],
    );
    return (
        <Column key={pipeline.id} span={1}>
            <Flex justifyBetween alignCenter>
                <h3>
                    <Dot color={color(pipeline.color, pipeline.colorLevel)} />
                    {t(pipeline.name)}
                </h3>
                <Text>
                    <span>
                        {leads.length} {t("leads.leads")}:{" "}
                    </span>
                    <Tooltip title={dollars(cost)}>{dollars(smooth(cost / forex), "$")}</Tooltip>
                </Text>
            </Flex>
            <Line color={color(pipeline.color, pipeline.colorLevel)} />
            <Droppable droppableId={pipeline.id.toString()}>{droppableBodyFunction}</Droppable>
        </Column>
    );
});
