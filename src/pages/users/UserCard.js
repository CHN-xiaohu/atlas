import {useHistory} from "react-router-dom";
import {Avatar, Card, Space, Typography, Tag} from "antd";
import {Flex} from "../../styled/flex";
import {Dot} from "../common/Dot";
import {color, date} from "../../Helper";
import {memo} from "react";
import styled from "styled-components";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "../../hooks/useGlobalState";
import {getImageLink} from "Helper";
import * as moment from "moment";

const {Text} = Typography;

const CardContent = styled.div`
    display: flex;
`;
const CardInfo = styled.div`
    width: 100%;
    flex-grow: 1;
`;

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
`;

const Status = styled(Tag)`
    margin: 0 !important;
`;

const time = (unix, t) => {
    if (unix == null) {
        return t("pages.never");
    }
    if (typeof unix === "number") {
        return date(moment.unix(unix));
    }
    return date(moment(unix));
};

export const UserCard = memo(({data: user, active, online}) => {
    const {t} = useTranslation();
    const [loginUser] = useGlobalState("user");
    const history = useHistory();
    return (
        <Card
            key={user._id}
            size="small"
            style={{
                marginBottom: "2px",
                backgroundColor: active,
            }}
            hoverable={true}
            onClick={() => {
                history.push(`/users/${user.login}`);
            }}
        >
            <Card.Meta
                avatar={
                    <Avatar
                        src={getImageLink(user?.avatar, "avatar_webp", loginUser?.session)}
                        size={50}
                        shape="square"
                    />
                }
                description={
                    <CardContent>
                        <CardInfo>
                            <ContentWrapper>
                                <Flex justifyBetween>
                                    <Text delete={user.banned}>{user.name}</Text>
                                    {online ? (
                                        <Status color="green">{t("pages.online")}</Status>
                                    ) : (
                                        <Status>{time(user.lastOnline, t)}</Status>
                                    )}
                                </Flex>
                                <Space>
                                    {t(`pages.${user.title ?? "resigned"}`)}
                                    {user.title === "client manager" && <Dot color={color(user?.color)} />}
                                </Space>
                            </ContentWrapper>
                        </CardInfo>
                    </CardContent>
                }
            />
        </Card>
    );
});
