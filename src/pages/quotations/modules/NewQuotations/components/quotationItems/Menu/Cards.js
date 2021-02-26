import {memo, useContext, useState} from "react";
import {cardShadowPadding} from "./style";
import {Card, QuestionCard} from "./Card";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import {useDataMutation} from "hooks/useDataMutation";
import {QuotationContext} from "../Context";
import {useQuery, useQueryClient} from "react-query";
import {useGlobalState} from "hooks/useGlobalState";
import {Button} from "antd";
import {PushpinOutlined, ShoppingCartOutlined} from "@ant-design/icons";
import {AddCustomItemModal} from "../impureUI/AddCustomItemModal";
import {LimitedView} from "pages/common/LimitedView";
import {useTranslation} from "react-i18next";
import {Spinner} from "pages/common/Spinner";
const getItemStyle = ({draggableStyle}) => ({
    userSelect: "none",
    ...draggableStyle,
});

const getListStyle = () => ({
    padding: cardShadowPadding,
});

const defaultFunc = () => {};
export const Cards = memo(
    ({
        lead,
        quotation,
        quotationItems,
        onSwitchQuotationItem,
        quotationItemUnreads,
        onSelectQuotation = defaultFunc,
        scrollToViewportByRef,
    }) => {
        const {t} = useTranslation();
        const [user] = useGlobalState("user");
        const [readStatus] = useGlobalState("readStatus");
        const [approveStatus] = useGlobalState("approveStatus");
        const canEdit = user?.access?.products?.canEditQuotations;

        const queryClient = useQueryClient();
        const {activeQuotation} = useContext(QuotationContext);
        const reorder = (quotationItems, srcSort, destSort) => {
            quotationItems = Array.from(quotationItems);
            const [removed] = quotationItems.splice(srcSort, 1);
            quotationItems.splice(destSort, 0, removed);
            return quotationItems.map((item, sort) => ({...item, sort}));
        };

        const {data: originalTheLastOneComments, isPlaceholderData, isIdle} = useQuery(
            [
                "comments",
                {
                    method: "theLastCommentForClient",
                    quotationId: quotationItems?.[0]?.quotation,
                    leadId: lead?._id,
                },
            ],
            {
                enabled: quotationItems?.length > 0 && lead?._id != null,
                placeholderData: {},
            },
        );
        const theLastOneComments = isIdle ? {} : originalTheLastOneComments;

        const {mutate: changePosition} = useDataMutation("/newQuotationItems/changePosition", {
            onMutate: async ({_id, destSort}) => {
                await queryClient.cancelQueries("newQuotationItems");

                const previous = queryClient.getQueryData("newQuotationItems");

                queryClient.setQueryData(
                    [
                        "newQuotationItems",
                        {
                            method: "forQuotations",
                            quotationIds: [activeQuotation._id],
                            leadId: lead?._id,
                            readStatus,
                            approveStatus,
                        },
                    ],
                    oldQuotationItems => {
                        const srcSort = oldQuotationItems.find(item => item._id === _id).sort;
                        return reorder(oldQuotationItems, srcSort, destSort);
                    },
                );

                return () => queryClient.setQueryData("newQuotationItems", previous);
            },
            onError: (err, data, rollback) => rollback(),
        });

        /** about customization **/
        const [customizationModalVisible, toggleCustomizationModalVisible] = useState();

        if (isPlaceholderData) {
            return <Spinner />;
        }

        const onDragEnd = result => {
            if (!result.destination) return;
            const srcSort = result.source.index;
            const destSort = result.destination.index;
            const selectedItem = quotationItems.find(item => item.sort === srcSort);
            changePosition({
                _id: selectedItem._id,
                destSort,
            });
            // const items = reorder(
            //     quotationItems,
            //     startIndex,
            //     distIndex
            // );
        };

        const handleShowCustomizationModal = () => {
            toggleCustomizationModalVisible(true);
        };

        const handleHideCustomizationModal = () => {
            toggleCustomizationModalVisible(false);
        };

        return canEdit ? (
            <>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="quotation-items-droppable">
                        {(provided, snapshot) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                style={getListStyle({isDraggingOver: snapshot.isDraggingOver})}
                            >
                                <QuestionCard
                                    theLastOneComment={theLastOneComments[lead?._id]}
                                    onSwitch={onSwitchQuotationItem}
                                    leadId={quotation.lead}
                                    unreadCount={quotationItemUnreads[lead?._id]}
                                    scrollToViewportByRef={scrollToViewportByRef}
                                />
                                {quotationItems.map((quotationItem, position) => {
                                    const theLastOneComment = theLastOneComments[quotationItem._id];
                                    return (
                                        <Draggable
                                            key={quotationItem._id}
                                            draggableId={quotationItem._id}
                                            index={quotationItem.sort}
                                        >
                                            {provided => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={getItemStyle({
                                                        isDragging: snapshot.isDragging,
                                                        draggableStyle: provided.draggableProps.style,
                                                    })}
                                                >
                                                    <Card
                                                        theLastOneComment={theLastOneComment}
                                                        onSwitchQuotationItem={onSwitchQuotationItem}
                                                        quotationItem={quotationItem}
                                                        unreadCount={quotationItemUnreads[quotationItem._id]}
                                                        position={position}
                                                        scrollToViewportByRef={scrollToViewportByRef}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}
                                <LimitedView groups={[(g, user) => user?.access?.products?.canEditQuotations]}>
                                    <Button
                                        type="primary"
                                        block
                                        onClick={() => onSelectQuotation(activeQuotation._id)}
                                        icon={<ShoppingCartOutlined />}
                                        style={{marginBottom: ".5rem"}}
                                    >
                                        {t("quotation.addItem")}
                                    </Button>
                                </LimitedView>
                                <LimitedView groups={[(g, user) => user?.access?.products?.canEditQuotations]}>
                                    <Button block onClick={handleShowCustomizationModal} icon={<PushpinOutlined />}>
                                        {t("quotation.addCustomItem")}
                                    </Button>
                                </LimitedView>
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
                {customizationModalVisible && (
                    <AddCustomItemModal
                        quotationId={quotation._id}
                        onOk={handleHideCustomizationModal}
                        onCancel={handleHideCustomizationModal}
                    />
                )}
            </>
        ) : (
            <div style={getListStyle({isDraggingOver: false})}>
                {quotationItems.map((quotationItem, position) => {
                    const theLastOneComment = theLastOneComments[quotationItem._id];
                    return (
                        <div
                            style={getItemStyle({
                                isDragging: false,
                                draggableStyle: {},
                            })}
                        >
                            <Card
                                theLastOneComment={theLastOneComment}
                                onSwitchQuotationItem={onSwitchQuotationItem}
                                quotationItem={quotationItem}
                                position={position}
                                scrollToViewportByRef={scrollToViewportByRef}
                            />
                        </div>
                    );
                })}
            </div>
        );
    },
);
