import { memo } from "react";
import {Spinner} from "../../common/Spinner";
import {Timeline, Typography} from "antd";
import moment from "moment";
import {LogMessage} from "./Message";
import {useQuery} from "react-query";
import {useTranslation} from "react-i18next";
const {Paragraph} = Typography;

export const LogList = memo(({user, from, to, event, type}) => {
    const {data: logs, isLoading} = useQuery([
        "logs",
        {
            user,
            from,
            to,
            event,
            type,
        },
    ]);
    const {t} = useTranslation();
    if (isLoading) return <Spinner />;
    return (
        <div>
            <Paragraph strong>
                {t("users.inTotal")}: {logs.length} {t("users.events")}
            </Paragraph>
            <Timeline>
                {logs
                    .slice()
                    .sort((a, b) => a.time.valueOf() - b.time.valueOf())
                    ?.map(log => (
                        <Timeline.Item key={log._id}>
                            {moment(log.time).format("D MMMM YYYY HH:mm:ss")}
                            <LogMessage key={`message${log._id}`} {...log} />
                        </Timeline.Item>
                    ))}
            </Timeline>
        </div>
    );
});
