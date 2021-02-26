import {memo, useCallback, useContext} from "react";
import {Button, Modal} from "antd";
import styled from "styled-components";
import {PlusOutlined} from "@ant-design/icons";
import {Mailer} from "./Mailer";
import {Flex} from "../../styled/flex";
import {SettingsContext, SettingsDispatcherContext} from "../Mailbox";
import {useTranslation} from "react-i18next";

const ScrollContent = styled.div`
    height: 75vh;
    overflow-y: auto;
`;

export const SendView = memo(() => {
    const {t} = useTranslation();
    const {settings} = useContext(SettingsContext);
    const {setSettings, resetSettings} = useContext(SettingsDispatcherContext);

    const {visible} = settings;

    const handleModelVisible = useCallback(() => {
        resetSettings({visible: true});
    }, [resetSettings]);

    const handleModelCancel = useCallback(() => {
        setSettings({...settings, visible: false});
    }, [setSettings, settings]);

    return (
        <>
            <Flex center>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleModelVisible}>
                    {t("mailbox.compose")}
                </Button>
            </Flex>

            <Modal
                title={t("mailbox.sendMail")}
                visible={visible}
                onCancel={handleModelCancel}
                width="70%"
                footer={null}
                style={{marginTop: -50}}
                bodyStyle={{marginLeft: 0, marginBottom: 0}}
            >
                <ScrollContent>
                    <Mailer />
                </ScrollContent>
            </Modal>
        </>
    );
});
