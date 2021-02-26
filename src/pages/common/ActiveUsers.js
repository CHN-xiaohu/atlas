import {memo} from "react";
import {Avatar, Tooltip} from "antd";
import {getImageLink} from "Helper";

export const ActiveUsers = memo(({style, users}) => {
    return (
        <div style={style}>
            <Avatar.Group>
                {users.map(user => (
                    <Tooltip title={user?.name || user?.login}>
                        <Avatar
                            key={user.login}
                            src={
                                getImageLink(user?.avatar, "avatar_webp", user?.session) ||
                                "https://files.globus.furniture/avatars/default.webp"
                            }
                            style={{
                                border: "1px white solid",
                                cursor: "pointer",
                            }}
                        >
                            {user?.name || user?.login}
                        </Avatar>
                    </Tooltip>
                ))}
            </Avatar.Group>
        </div>
    );
});
