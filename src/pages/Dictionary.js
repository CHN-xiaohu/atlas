import {memo} from "react";
import {EditableTable} from "./common/EditableTable";
import {Popconfirm, Button, message} from "antd";
import {useDataMutation} from "../hooks/useDataMutation";
import {Switch, Route} from "react-router-dom";
import {useTranslation} from "react-i18next";
import moment from "moment";
import {AddDictionary} from "./dictionary/AddDictionary";
import {useQuery, useQueryClient} from "react-query";
import {DictionaryTable} from "./dictionary/DictionaryTable";
import {Spinner} from "./common/Spinner";
import {LimitedView} from "./common/LimitedView";
import {useGlobalState} from "../hooks/useGlobalState";

export const Dictionary = memo(() => {
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const {data, isPlaceholderData} = useQuery(["dictionaries"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const [user] = useGlobalState("user");
    const {mutate: addDictionary} = useDataMutation("/dictionaries/add", {
        onSuccess: () => {
            queryClient.invalidateQueries("dictionaries");
        },
    });
    const {mutate: changeWord} = useDataMutation("/dictionaries/changeWord", {
        onSuccess: () => {
            queryClient.invalidateQueries("dictionaries");
        },
    });
    const {mutate: addWord} = useDataMutation("/dictionaries/addWord", {
        onSuccess: () => {
            queryClient.invalidateQueries("dictionaries");
        },
    });
    const {mutate: removeDictionary} = useDataMutation("/dictionaries/removeDictionary", {
        onSuccess: () => {
            queryClient.invalidateQueries("dictionaries");
        },
    });
    const columns = [
        {
            title: t("pages.name"),
            type: "text",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            hide: false,
        },
        {
            title: t("pages.quantity"),
            type: "text",
            dataIndex: "words",
            render: words => words?.length ?? 0,
            hide: false,
        },
        {
            title: t("pages.modificationDate"),
            type: "text",
            dataIndex: "updated_at",
            render: time => moment(time).format("YYYY-MM-DD HH:mm:ss"),
            sorter: (a, b) => moment(a.updated_at).unix() - moment(b.updated_at).unix(),
            hide: false,
        },
        {
            title: t("pages.operation"),
            dataIndex: "operation",
            hide: user?.access?.dictionary?.canDeleteDictionary !== true,
            render: (text, record) => (
                <LimitedView groups={[(g, user) => user?.access?.dictionary?.canDeleteDictionary]}>
                    <Popconfirm
                        okText={t("pages.ok")}
                        cancelText={t("pages.cancel")}
                        title={`${t("pages.sureToDelete")}?`}
                        onCancel={e => e.stopPropagation()}
                        onConfirm={e => {
                            e.stopPropagation();
                            removeDictionary(record, {
                                onSuccess: () => {
                                    message.success(`${t("pages.successfullyDeleted")}!`);
                                },
                            });
                        }}
                    >
                        <Button type="link" danger onClick={e => e.stopPropagation()}>
                            {t("pages.delete")}
                        </Button>
                    </Popconfirm>
                </LimitedView>
            ),
        },
    ];

    return (
        <Switch>
            <Route
                path="/dictionary/:id"
                render={({match}) => {
                    const id = match.params.id;
                    const dictionary = data.find(d => d._id === id);
                    if (isPlaceholderData) {
                        return <Spinner />;
                    } else if (dictionary == null) {
                        return "No such id";
                    }
                    return (
                        <DictionaryTable
                            onChangeWord={row => {
                                const word = dictionary.words.find(word => word.key === row.key);
                                const prop = Object.keys(row).find(prop => word[prop] !== row[prop]);
                                changeWord({dictionary: id, key: row.key, prop, value: row[prop]});
                            }}
                            onAddWord={word => {
                                addWord({dictionary: id, word});
                            }}
                            active={data.find(dictionary => dictionary._id === id)}
                        />
                    );
                }}
            />
            <Route
                path="/dictionary"
                render={({history}) => {
                    return (
                        <>
                            <EditableTable
                                loading={isPlaceholderData}
                                rowKey="_id"
                                onRow={record => {
                                    return {
                                        onClick: event => {
                                            history.push(`/dictionary/${record._id}`);
                                        },
                                    };
                                }}
                                columns={columns.filter(column => column.hide === false)}
                                dataSource={data}
                                size={"small"}
                            />
                            <LimitedView groups={[(g, user) => user?.access?.dictionary?.canAddDictionary]}>
                                <AddDictionary
                                    dictionary={data}
                                    onAddDictionary={data => {
                                        addDictionary(data);
                                    }}
                                />
                            </LimitedView>
                        </>
                    );
                }}
            />
        </Switch>
    );
});
