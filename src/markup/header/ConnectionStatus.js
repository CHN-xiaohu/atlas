import {memo} from "react";
import {color, isProduction} from "../../Helper";
import {Space, Typography} from "antd";
import {SyncOutlined, BugFilled} from "@ant-design/icons";
import {useSocket} from "../../hooks/useSocket";
import {useSocketStorage} from "../../hooks/useSocketStorage";
import {version} from "../../../package.json";
import styled from "styled-components";

const {Text} = Typography;

const MagicBugIcon = styled(BugFilled)`
    @keyframes rainbow {
        14%   {color: ${color("red")};}
        28%  {color: ${color("orange")};}
        42%  {color: ${color("yellow")};}
        56% {color:  ${color("green")};}
        70% {color:  ${color("cyan")};}
        84% {color:  ${color("blue")};}
        100% {color:  ${color("purple")};}
    }
    font-size: 2em;
    color: ${props => props.color};
    animation: rainbow 3s infinite paused;
    :hover {
        animation-play-state: running;
    }
`;

export const ConnectionStatus = memo(() => {
    const api = useSocketStorage("version");
    const {socket} = useSocket();
    const {connected: server} = socket;
    return isProduction() ? (
        <Space>
            <Text>Atlas v{version}</Text>
            <SyncOutlined spin={server} />
            <Text>API v{api} </Text>
        </Space>
    ) : (
        <MagicBugIcon color={color(server ? "green" : "red")} spin={!server} />
    );
});
