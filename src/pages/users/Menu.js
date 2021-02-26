import {UserCard} from "./UserCard";
import {color} from "../../Helper";
import moment from "moment";
import {List} from "antd";
import {useQuery} from "react-query";
import {memo} from "react";
import {useEffect} from "react";
import {useHistory} from "react-router-dom";
import {useSocketStorage} from "../../hooks/useSocketStorage";

export const Menu = memo(({showBanned: banned, active: current}) => {
    const {data: users, isPlaceholderData} = useQuery(
        [
            "users",
            {
                method: "get",
                banned: banned,
            },
        ],
        {
            placeholderData: [],
            staleTime: 4 * 60 * 60 * 1000,
            cacheTime: 4 * 60 * 60 * 1000,
        },
    );
    const history = useHistory();
    useEffect(() => {
        if (users.length > 0 && current == null) {
            history.push(`/users/${users[0].login}`);
        }
    }, [current, history, users]);

    const activeUsers = useSocketStorage("active-users", []);
    return (
        <List
            loading={isPlaceholderData}
            size="large"
            renderItem={user => (
                <UserCard
                    data={user}
                    active={user.login === current ? color(user.color ?? "blue", 0) : null}
                    online={activeUsers.includes(user.login)}
                />
            )}
            dataSource={users
                .filter(user => user.login !== "client")
                .sort((a, b) => {
                    if (activeUsers.includes(a.login) && activeUsers.includes(b.login)) {
                        return a.title.localeCompare(b.title);
                    } else if (activeUsers.includes(a.login) && !activeUsers.includes(b.login)) {
                        return -1;
                    } else if (!activeUsers.includes(a.login) && activeUsers.includes(b.login)) {
                        return 1;
                    }
                    return moment(b.lastOnline).unix() - moment(a.lastOnline).unix();
                })}
        />
    );
});
