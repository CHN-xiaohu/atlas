import {Layout} from "antd";
import {memo, useEffect, useState} from "react";
import styled from "styled-components";
import {useQuery} from "react-query";
import {ActiveUsers} from "../pages/common/ActiveUsers";
import {useSocketStorage} from "../hooks/useSocketStorage";
import {ClockCircleOutlined} from "@ant-design/icons";
const StyledFooter = styled(Layout.Footer)`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ActiveUsersWrapper = memo(() => {
    const activeUsers = useSocketStorage("active-users", []);
    const {data: users, isSuccess} = useQuery(["users"], {
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
        enabled: Array.isArray(activeUsers) && activeUsers.length > 0,
    });
    if (isSuccess) {
        return <ActiveUsers users={users.filter(user => activeUsers.includes(user.login))} />;
    } else {
        return null;
    }
});

const getTimestamp = () => ~~(Date.now() / 1000);

const UnixTimeStampClock = memo(() => {
    const [time, setTime] = useState(getTimestamp());
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(getTimestamp());
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);
    return (
        <div>
            <ClockCircleOutlined /> {time}
        </div>
    );
});

export const Footer = memo(() => {
    return (
        <StyledFooter>
            <UnixTimeStampClock />
            <div>{<ActiveUsersWrapper />}</div>
        </StyledFooter>
    );
});
