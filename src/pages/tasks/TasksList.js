import { memo } from "react";
import {Table, Tag} from "antd";
import * as moment from "moment";
import {color, leadName} from "../../Helper";
import styled from "styled-components";
import {useTranslation} from "react-i18next";

const StyledTable = styled(Table)`
    tr.completed {
        background-color: ${color("green", 0)};
    }
`;

export const TasksList = memo(({data, loading}) => {
    const {t} = useTranslation();
    const columns = [
        {
            title: t("tasks.lead"),
            dataIndex: "lead",
            render: lead => leadName(lead),
        },
        {
            title: t("tasks.text"),
            dataIndex: "text",
        },
        {
            title: t("tasks.leadStatus"),
            dataIndex: "lead.pipeline",
            render: data => <Tag color={data?.color}>{data?.name}</Tag>,
        },
        {
            title: t("tasks.completeTill"),
            dataIndex: "complete_till",
            render: data => moment(data).format("HH:mm DD MMMM"),
        },
    ];
    return (
        <StyledTable
            dataSource={data}
            columns={columns}
            rowKey="_id"
            rowClassName={task => {
                return task.status === true ? "completed" : null;
            }}
        />
    );
});
