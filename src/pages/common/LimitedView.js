import {memo} from "react";
import {useGlobalState} from "../../hooks/useGlobalState";

export const LimitedView = memo(({groups, children, no = null}) => {
    const [user] = useGlobalState('user');
    return groups.find(g => g(user.group, user)) ? children : no;
});
