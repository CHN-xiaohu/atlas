import {memo, useEffect, useCallback} from "react";
import {Modal, Button} from "antd";
import {useInnerState} from "hooks/useInnerState";
import styled from "styled-components";
import {useTranslation} from "react-i18next";
import {Progressive} from "pages/quotations/modules/NewQuotations/components/quotationItems/Comment/Picture";

const Viewer = styled(Modal)`
    height: 85vh;
    .ant-modal-content {
        width: 100%;
        height: 100%;
    }
    .ant-modal-body {
        height: 88%;
        width: 100%;
    }
`;

const Footer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const ImageWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    .picture {
        width: 100%;
        height: 100%;
    }
`;

export const MessageViewer = memo(({activeIndex, files, ...modalParams}) => {
    const {t} = useTranslation();
    const [innerActiveIndex, setInnerActiveIndex] = useInnerState(activeIndex);

    const prevButtonDisabled = innerActiveIndex <= 0;
    const nextButtonDisabled = innerActiveIndex >= files.length - 1;

    const handlePrevPicture = useCallback(() => {
        setInnerActiveIndex(innerActiveIndex => innerActiveIndex - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNextPicture = useCallback(() => {
        setInnerActiveIndex(innerActiveIndex => innerActiveIndex + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handle = e => {
            if (e.keyCode === 37) {
                e.preventDefault();
                !prevButtonDisabled && handlePrevPicture();
            }
            if (e.keyCode === 39) {
                e.preventDefault();
                !nextButtonDisabled && handleNextPicture();
            }
        };

        window.document.addEventListener("keydown", handle);
        return () => {
            window.document.removeEventListener("keydown", handle);
        };
    }, [handlePrevPicture, handleNextPicture, prevButtonDisabled, nextButtonDisabled]);

    return (
        <Viewer
            visible={true}
            centered
            title={t("quotation.previewPicture")}
            width="85vw"
            footer={
                <Footer>
                    <Button disabled={prevButtonDisabled} onClick={handlePrevPicture}>
                        {t("quotation.previous")}
                    </Button>
                    <div>
                        {innerActiveIndex + 1}/{files.length}
                    </div>
                    <Button disabled={nextButtonDisabled} onClick={handleNextPicture}>
                        {t("quotation.next")}
                    </Button>
                </Footer>
            }
            {...modalParams}
        >
            <ImageWrapper>
                <Progressive
                    className="picture"
                    imageId={files[innerActiveIndex]}
                    imgStyle={{backgroundColor: "white"}}
                    onClick={e => e.stopPropagation()}
                />
            </ImageWrapper>
        </Viewer>
    );
});
