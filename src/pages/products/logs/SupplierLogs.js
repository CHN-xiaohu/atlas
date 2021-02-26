import { memo } from "react";
import {Timeline} from "antd";
import {Spinner} from "../../common/Spinner";
import moment from "moment";
import {AuthorBadge} from "../../leads/lead/modules/timeline/LogNote";
import {LogMessage} from "../../users/logs/Message";
import {useQuery} from "react-query";

export const SupplierLogs = memo(({supplier}) => {
    const {data: logs, isLoading} = useQuery(['logs', {
        method: "byType",
        type: "supplier",
        id: supplier._id,
    }], {
        enabled: supplier._id != null
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
