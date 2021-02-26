/* eslint-disable immutable/no-let */
import { memo, useState } from "react";
import {FileExcelOutlined} from "@ant-design/icons";
import {Button, Space} from "antd";
import {download} from "../../../../Helper";
import moment from "moment";
import {useRequest} from "../../../../hooks/useRequest";

export const generateReportRequestData = (columns, data, reportType, reportName, name, id) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const reportColumns = columns.filter(c => {
        return c.reports != null && c.reports[reportType] != null;
    });

    let columnsResult = reportColumns.map(column => ({
        key: column.dataIndex,
        ...column.reports[reportType],
        type: column.type,
    }));

    let mergedCells = data
        .map((row, rowIndex) => {
            if (row.rowSpanItem === true) {
                return reportColumns
                    .map((column, columnIndex) => {
                        if (column.hasMergedCell === true) {
                            const excelColumnIndex = letters[columnIndex];
                            const startExcelRowIndex = rowIndex + 2;
                            const endExcelRowIndex = startExcelRowIndex + row.purchasesLengthOfReceipt - 1;
                            return `${excelColumnIndex}${startExcelRowIndex}:${excelColumnIndex}${endExcelRowIndex}`;
                        } else {
                            return null;
                        }
                    })
                    .filter(item => item != null);
            } else {
                return null;
            }
        })
        .filter(item => item != null)
        .flat();

    return {
        columns: columnsResult,
        data: data.map((row, rowIndex) => {
            const result = reportColumns.reduce((obj, columnMeta) => {
                if (columnMeta.hasMergedCell === true && typeof columnMeta.render === "function") {
                    obj[columnMeta.dataIndex] = columnMeta.render(row[columnMeta.dataIndex], row, rowIndex).children;
                } else {
                    obj[columnMeta.dataIndex] = row[columnMeta.dataIndex];
                    console.log(`${columnMeta.dataIndex}???`, row, row[columnMeta.dataIndex]);
                }
                return obj;
            }, {});
            return result;
        }),
        mergedCells,
        name: `${reportName}-${moment().valueOf()}`,
        type: name,
        lead: id,
    };
};

export const ReportsGenerator = memo(({reports, columns, data, id}) => {
    const [generating, setGenerating] = useState();
    const generateExcel = useRequest("/invoices/generateExcel");
    return (
        <Space>
            {reports.map(report => {
                return (
                    <Button
                        disabled={generating != null}
                        loading={generating === report.key}
                        key={report.key}
                        icon={<FileExcelOutlined />}
                        type="text"
                        onClick={async () => {
                            try {
                                setGenerating(report.key);
                                const answer = await generateExcel(
                                    generateReportRequestData(
                                        columns,
                                        data,
                                        report.key,
                                        `${report.key}-${id}`,
                                        reports.find(r => r.key === report.key).name,
                                        id,
                                    ),
                                );
                                download(answer.link, `${report.key}-${id}`);
                            } finally {
                                setGenerating();
                            }
                        }}
                    >
                        {report.name}
                    </Button>
                );
            })}
        </Space>
    );
});
