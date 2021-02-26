import {memo} from "react";
import styled from "styled-components";
import {Modal} from "antd";
import {Comment} from "./Comment";
import {useTranslation} from "react-i18next";

const ContentWrapper = styled.div`
    height: calc(70vh - 84px) !important;
`;

export const CommentModal = memo(({...modalParams}) => {
    const {t} = useTranslation();
    return (
        <Modal title={t("leads.comment")} footer={null} {...modalParams}>
            <ContentWrapper>
                <Comment />
            </ContentWrapper>
        </Modal>
    );
});
