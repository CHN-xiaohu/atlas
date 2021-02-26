import { memo } from "react";
import {CheckOutlined, ClockCircleOutlined, WarningOutlined} from "@ant-design/icons";
import {Radio, Input, Tooltip, Progress, List, Divider, Typography, Avatar, Space} from "antd";
import {makeArray, smooth} from "../../../../../Helper";
import styled from "styled-components";
import {CompatiblePictureWall} from "pages/common/PictureWall";
import {Flex} from "../../../../../styled/flex";
import {Spinner} from "../../../../common/Spinner";
import {useDataMutation} from "../../../../../hooks/useDataMutation";
import {useQuery, useQueryClient} from "react-query";
import {useTranslation} from "react-i18next";
const {Title} = Typography;
const Item = styled(List.Item)`
    .ant-list-item-action {
        display: flex;
        align-items: center;
        li {
            display: inline-flex;
            height: auto;
        }
    }
`;

const TextArea = styled(Input.TextArea)`
    min-width: 20vw;
`;

const ReceiptTitle = styled(Title).attrs({
    level: 4,
})`
    margin-bottom: 0 !important;
`;

const Image = styled.img.attrs({
    alt: "",
})`
    max-height: 50vh;
    max-width: 50vw;
`;

const Preview = memo(({photo}) => {
    return (
        <Tooltip placement="topRight" title={<Image src={photo} />}>
            <Avatar shape="square" src={photo} size={150} />
        </Tooltip>
    );
});

export const QualityChecks = memo(({_id}) => {
    const queryClient = useQueryClient()
    const {mutate: update} = useDataMutation("/purchases/update", {
        onSuccess: () => {
            queryClient.invalidateQueries("purchases");
        },
    });
    const {t} = useTranslation()
    //TODO optimize to directly load recipes

    const {data: purchases} = useQuery(['purchases', {
        method: "forLeads",
        leads: [_id],
    }], {
        enabled: _id != null
    })

    const receipts =  [
        ...new Set(
            purchases
                .filter(purchase => purchase.lead === _id && purchase.receipt != null)
                .map(purchase => purchase.receipt),
        ),
    ].map(receipt => ({
        receipt,
        items: purchases.filter(purchase => purchase.receipt === receipt),
    }))

    if (!Array.isArray(receipts)) {
        return <Spinner />;
    }

    const verified = receipts
        .map(receipt => receipt.items.filter(item => item.qc === "ok")?.length)
        .reduce((a, b) => a + b, 0);
    const withProblem = receipts
        .map(receipt => receipt.items.filter(item => item.qc === "problems")?.length)
        .reduce((a, b) => a + b, 0);
    const total = receipts.map(receipt => receipt.items?.length).reduce((a, b) => a + b, 0);
    const toDo = total - verified - withProblem;
    return (
        <>
            <Divider />
            <Tooltip
                title={`${verified} ${t("leads.isOk")} / ${withProblem} ${t("leads.haveProblems")} / ${toDo} ${t(
                    "leads.toDo",
                )}`}
            >
                <Progress
                    percent={smooth(((verified + withProblem) / total) * 100)}
                    successPercent={smooth((verified / total) * 100)}
                />
            </Tooltip>
            <div>
                {receipts.map(receipt => (
                    <List
                        header={
                            <Flex justifyBetween>
                                <ReceiptTitle>{`${t("leads.receipt")} #${receipt.receipt}`}</ReceiptTitle>
                            </Flex>
                        }
                        dataSource={receipt.items}
                        renderItem={item => (
                            <Item
                                key={item._id}
                                actions={makeArray(
                                    [
                                        {
                                            show: item.qc === "ok" || item.qc === "problems",
                                            value: (
                                                <CompatiblePictureWall
                                                    imageHeight="9rem"
                                                    uploadWidth="9rem"
                                                    uploadHeight="9rem"
                                                    id={item._id}
                                                    files={item.qcPhotos || []}
                                                    onChange={photos => {
                                                        update({...item, qcPhotos: photos});
                                                    }}
                                                />
                                            ),
                                        },
                                        {
                                            show: item.qc === "problems",
                                            value: <TextArea placeholder={`${t("leads.whatKindOfProblems")}?`} />,
                                        },
                                    ],
                                    [
                                        <Radio.Group
                                            value={item.qc || "toDo"}
                                            onChange={({target}) => {
                                                update({
                                                    ...item,
                                                    qc: target.value,
                                                });
                                            }}
                                        >
                                            <Radio.Button value="toDo">
                                                <ClockCircleOutlined />
                                            </Radio.Button>
                                            <Radio.Button value="ok">
                                                <CheckOutlined />
                                            </Radio.Button>
                                            <Radio.Button value="problems">
                                                <WarningOutlined />
                                            </Radio.Button>
                                        </Radio.Group>,
                                    ],
                                )}
                            >
                                <List.Item.Meta
                                    title={item.item}
                                    description={
                                        <>
                                            <p>{item.description}</p>
                                            <Space>
                                                {item.photo != null ? (
                                                    Array.isArray(item.photo) ? (
                                                        item.photo.map(photo => <Preview photo={photo} />)
                                                    ) : (
                                                        <Preview photo={item.photo} />
                                                    )
                                                ) : (
                                                    t("leads.noPhotos")
                                                )}
                                            </Space>
                                        </>
                                    }
                                />
                            </Item>
                        )}
                    />
                ))}
            </div>
        </>
    );
});
