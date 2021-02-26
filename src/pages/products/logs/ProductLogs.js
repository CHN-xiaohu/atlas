import {Spinner} from "../../common/Spinner";
import {Timeline} from "antd";
import moment from "moment";
import { memo } from "react";
import {AuthorBadge} from "../../leads/lead/modules/timeline/LogNote";
import {LogMessage} from "../../users/logs/Message";
import {useQuery} from "react-query";

export const ProductLogs = memo(({product}) => {
    const {data: logs, isLoading} = useQuery(['logs', {
        method: "byType",
        type: "product",
        id: product._id,
        sort: {
            created_at: 1
        }
    }], {
        enabled: product._id != null
    })
    if (isLoading) {
        return <Spinner />;
    }
    return (
        <Timeline>
            {logs.map(log => {
                const time = moment(log.time);
                return (
                    <Timeline.Item key={log._id}>
                        <AuthorBadge login={log.author} time={time} /> <LogMessage {...log} />
                    </Timeline.Item>
                );
            })}
        </Timeline>
    );
});
