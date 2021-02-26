import {memo} from "react";
import {Popconfirm, Button, message} from "antd";
import {EditableTable} from "../common/EditableTable";
import {ArrowLeftOutlined} from "@ant-design/icons";
import {useDataMutation} from "../../hooks/useDataMutation";
import {Link} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {AddWord} from "./AddWord";
import {LimitedView} from "../common/LimitedView";
import {useGlobalState} from "../../hooks/useGlobalState";
import {useQueryClient} from "react-query";

export const DictionaryTable = memo(({active, onChangeWord, onAddWord}) => {
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const {mutate: removeWord} = useDataMutation("/dictionaries/removeWord", {
        onSuccess: () => {
            queryClient.invalidateQueries("dictionaries");
        },
    });
    const [user] = useGlobalState("user");
    const dictionaryColumns = [
        {
            title: t("pages.key"),
            type: "text",
            dataIndex: "key",
            sorter: (a, b) => a.key.localeCompare(b.key),
            hide: false,
        },
        {
            title: t("pages.english"),
            type: "text",
            dataIndex: "en",
            editable: user?.access?.dictionary?.canChangeWord,
            sorter: (a, b) => a.en.localeCompare(b.en),
            hide: false,
        },
        {
            title: t("pages.russian"),
            type: "text",
            dataIndex: "ru",
            editable: user?.access?.dictionary?.canChangeWord,
            sorter: (a, b) => a.ru.localeCompare(b.ru),
            hide: false,
        },
        {
            title: t("pages.chinese"),
            type: "text",
            dataIndex: "zh",
            editable: user?.access?.dictionary?.canChangeWord,
            sorter: (a, b) => a.zh.localeCompare(b.zh),
            hide: false,
        },
        {
            title: t("pages.tags"),
            type: "tags",
            dataIndex: "tags",
            editable: user?.access?.dictionary?.canChangeWord,
            hide: false,
        },
        {
            title: t("pages.operation"),
            dataIndex: "operation",
            hide: user?.access?.dictionary?.canRemoveWord !== true,
            render: (text, record) => (
                <LimitedView groups={[(g, user) => user?.access?.dictionary?.canRemoveWord]}>
                    <Popconfirm
                        okText={t("pages.ok")}
                        cancelText={t("pages.cancel")}
                        title={`${t("pages.sureToDelete")}?`}
                        onConfirm={e => {
                            e.stopPropagation();
                            removeWord(
                                {_id: active._id, key: record.key},
                                {
                                    onSuccess: () => {
                                        message.success(`${t("pages.successfullyDeleted")}!`);
                                    },
                                },
                            );
                        }}
                    >
                        <Button type="link" danger>
                            {t("pages.delete")}
                        </Button>
                    </Popconfirm>
                </LimitedView>
            ),
        },
    ];
    return (
        <>
            <Link to={"/dictionary"}>
                <Button type="text" icon={<ArrowLeftOutlined />} />
            </Link>
            <LimitedView groups={[(g, user) => user?.access?.dictionary?.canAddWord]}>
                <div>
                    <AddWord
                        words={active.words}
                        onAdd={word => {
                            onAddWord(word);
                        }}
                    />
                </div>
            </LimitedView>
            <EditableTable
                style={{marginTop: "10px"}}
                columns={dictionaryColumns.filter(column => column.hide === false)}
                dataSource={active.words}
                rowKey="key"
                onSave={row => {
                    onChangeWord(row);
                }}
                pagination={false}
                size="small"
            />
            <LimitedView groups={[(g, user) => user?.access?.dictionary?.canAddWord]}>
                <AddWord
                    words={active.words}
                    onAdd={word => {
                        onAddWord(word);
                    }}
                />
            </LimitedView>
        </>
    );
});
