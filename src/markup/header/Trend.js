import {Tooltip} from "antd";
import {smooth} from "../../Helper";
import {FallOutlined, RiseOutlined} from "@ant-design/icons";
import {memo} from "react";

export const Trend = memo(({value, previous}) => {
    const up = value > previous;
    return (
        <Tooltip color={up ? 'green' : 'red'} title={`${up ? "+" : ""}${smooth(value - previous, 3)}`}>
            {up ? <RiseOutlined /> : <FallOutlined />}
        </Tooltip>
    );
});
