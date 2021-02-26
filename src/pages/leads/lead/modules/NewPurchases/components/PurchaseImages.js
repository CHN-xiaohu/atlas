import {memo, useState} from "react";
import styled from "styled-components";
import {Modal} from "antd";

const PurchaseImage = styled.img`
    display: block;
    width: 100px;
    height: auto;

    padding: 8px;
    border: 1px solid #d9d9d9;
    border-radius: 2px;

    & + & {
        margin-top: 5px;
    }
`;

const FullPurchaseImage = styled.img`
    display: block;
    width: 100%;
    height: auto;
`;

export const PurchaseImages = memo(({urls}) => {
    const [fullIndex, setFullIndex] = useState(null);
    return urls.map((url, index) => (
        <>
            <PurchaseImage
                src={url}
                onClick={() => {
                    setFullIndex(index);
                }}
            />
            <Modal
                visible={fullIndex === index}
                width={1000}
                centered
                onCancel={() => {
                    setFullIndex(null);
                }}
                footer={false}
            >
                <FullPurchaseImage src={url} />
            </Modal>
        </>
    ));
});
