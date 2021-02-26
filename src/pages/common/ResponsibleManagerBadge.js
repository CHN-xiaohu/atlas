import {Avatar, Tooltip} from "antd";
import {getImageLink} from "Helper";
import {memo} from "react";

const defaultStyle = {marginRight: "5px"};

export const ResponsibleManagerBadge = memo(({user, style = defaultStyle}) => {
    if (user == null) {
        return null;
    }
    return (
        <Tooltip title={user.name}>
            <Avatar style={style} size="small" src={getImageLink(user?.avatar, "avatar_webp", user?.session)} />
        </Tooltip>
    );
});
