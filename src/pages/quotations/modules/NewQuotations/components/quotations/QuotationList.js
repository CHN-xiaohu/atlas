import styled from "styled-components";
import {useQuery} from "react-query";
import {List, Tooltip, Space} from "antd";
import {FlagIcon} from "pages/common/Flag";
import {usd, color} from "Helper";
import {Select, DownloadExcel, Share, Delete, Detail} from "../global/control";
import {ActiveUsers} from "pages/common/ActiveUsers";
import {makeArray} from "Helper";
import {useGlobalState} from "hooks/useGlobalState";
import {Edit, useCanShowEdit} from "../global/control/Edit";
import {useSocketStorage} from "../../../../../../hooks/useSocketStorage";
import {UnreadMessagesBadge} from "../quotationItems/Menu/Card";

const Link = styled.div`
    cursor: pointer;
    :hover {
        color: ${color("blue", 4)};
    }
`;

const ListItem = styled(List.Item)`
    padding-left: 10px;
    ${props =>
        props.clickAble &&
        `
        cursor: pointer;
        &:hover {
            background-color: #efefef;
        }
    `}
`;

const flagIconMap = {
    en: (
        <Tooltip title="English">
            <FlagIcon code="gb" />
        </Tooltip>
    ),
    ru: (
        <Tooltip title="Русский">
            <FlagIcon code="ru" />
        </Tooltip>
    ),
};

/**
 * getLInkTo // (quotationId) => {return "http://localhost";}
 */
export const QuotationList = ({
    quotations,
    hasControl = true,
    clickAble = false,
    clickLinkAble = true,
    showSelectControl = false,
    showDetailControl = false,
    onSelectQuotation,
    onClickLink = quotation => {},
    onClickQuotation = quotation => {},
    onClickDetail = quotation => {},
    className,
    style,
}) => {
    const [user] = useGlobalState("user");
    const canSeeComment = user?.access?.products?.canSeeComments;
    const canShowEdit = useCanShowEdit();

    const {data: quotationUnreadCount} = useQuery(
        [
            "comments",
            {
                method: "unreadForQuotations",
                quotationIds: quotations.map(quotation => quotation._id),
            },
        ],
        {
            enabled: canSeeComment && quotations?.length > 0,
            placeholderData: [],
        },
    );

    const rates = useSocketStorage("forex");

    const {data: users} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });

    quotations =
        users.length > 0
            ? quotations.map(quotation => {
                  const activeUsers = quotation.responsibles.map(responsible =>
                      users.find(user => user.login === responsible),
                  );
                  return {...quotation, activeUsers};
              })
            : quotations;

    const forex = usd(rates);

    const createActions = quotation => {
        return makeArray([
            {
                value: quotation.itemCount,
            },
            {
                value: <ActiveUsers style={{display: "inline-block"}} users={quotation.activeUsers} />,
            },
            {
                show: hasControl && showSelectControl,
                value: <Select quotation={quotation} onSelectQuotation={onSelectQuotation} />,
            },
            {
                show: hasControl,
                value: <DownloadExcel quotation={quotation} forex={forex} />,
            },
            {
                show: hasControl && canShowEdit,
                value: <Edit quotation={quotation} />,
            },
            {
                show: hasControl && showDetailControl,
                value: (
                    <Detail
                        onClickDetail={() => {
                            onClickDetail(quotation);
                        }}
                    />
                ),
            },
            {
                show: hasControl,
                value: <Share quotation={quotation} />,
            },
            {
                show: hasControl,
                value: <Delete quotation={quotation} />,
            },
        ]);
    };

    return (
        <List
            className={className}
            style={style}
            itemLayout="horizontal"
            dataSource={quotations}
            renderItem={quotation => (
                <ListItem
                    clickAble={clickAble}
                    actions={createActions(quotation)}
                    onClick={() => {
                        onClickQuotation(quotation);
                    }}
                >
                    <List.Item.Meta
                        title={
                            clickLinkAble ? (
                                <Link
                                    onClick={() => {
                                        onClickLink(quotation);
                                    }}
                                >
                                    <Space>
                                        {flagIconMap[quotation?.language]}
                                        <span>{quotation.name}</span>
                                        <UnreadMessagesBadge count={quotationUnreadCount[quotation._id]} />
                                    </Space>
                                </Link>
                            ) : (
                                <Space>
                                    {flagIconMap[quotation?.language]}
                                    <span>{quotation.name}</span>
                                    <UnreadMessagesBadge count={quotationUnreadCount[quotation._id]} />
                                </Space>
                            )
                        }
                    />
                </ListItem>
            )}
        />
    );
};
