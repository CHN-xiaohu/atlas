import {StarFilled} from "@ant-design/icons";
import {color} from "../../Helper";
import { memo } from "react";

export const Stars = memo(({count = 3, style}) => {
    return Array(count)
        .fill()
        .map((p, i) => <StarFilled key={i} style={{color: color("gold"), ...style}} />);
});
