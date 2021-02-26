import {memo} from "react";
import {Button, Divider, Result} from "antd";
import {Redirect, Route, Switch} from "react-router-dom";
import {TasksBoard as Board} from "./tasks/TasksBoard";
import {TasksList as List} from "./tasks/TasksList";
import {TasksSchedule} from "./tasks/TasksSchedule";
import {TasksControlPanel as TopPanel} from "./tasks/TasksControlPanel";
import {useLocalStorage} from "@rehooks/local-storage";
import {Spinner} from "./common/Spinner";
import {useQuery} from "react-query";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "hooks/useGlobalState";

export const Tasks = memo(() => {
    const {t} = useTranslation();
    const [user] = useGlobalState("user");
    const [settings, setSettings] = useLocalStorage("tasksSettings", {
        showCompleted: false,
        search: "",
        hideClientsOfDifferentManagers: true,
        responsible: ["sales manager", "project manager"].includes(user.title) ? user.login : null,
    });

    const {data: pipelines} = useQuery(["pipelines"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const {data: tasks, isPlaceholderData} = useQuery(
        [
            "tasks",
            {
                method: "active",
                search: settings.search,
                responsible: settings.responsible,
            },
        ],
        {placeholderData: []},
    );
    const {data: leads} = useQuery(
        [
            "leads",
            {
                method: "byIds",
                ids: [...new Set(tasks.map(task => task.lead))],
            },
        ],
        {
            placeholderData: [],
            enabled: tasks.length > 0,
        },
    );
    if (!Array.isArray(tasks)) {
        return <Spinner />;
    }

    const data = tasks.map(task => {
        const lead = leads.find(l => l._id === task.lead) ?? {};
        return {
            ...task,
            lead: lead && {
                ...lead,
                pipeline: pipelines.find(pipe => pipe.id === lead.status_id) || {},
            },
        };
    });

    return (
        <Switch>
            <Route
                path="/tasks/:view(\D+)"
                render={({match, history}) => {
                    const view = match.params.view;
                    return (
                        <>
                            <TopPanel
                                current={view}
                                history={history}
                                settings={settings}
                                onSettingsUpdate={setSettings}
                            />
                            <Divider />
                            <Switch>
                                <Route
                                    path="/tasks/board"
                                    render={() => {
                                        return <Board data={data} loading={isPlaceholderData} />;
                                    }}
                                />
                                <Route
                                    path="/tasks/list"
                                    render={() => {
                                        return <List data={data} loading={isPlaceholderData} />;
                                    }}
                                />
                                <Route
                                    path="/tasks/schedule"
                                    render={() => {
                                        return (
                                            <TasksSchedule
                                                data={data}
                                                loading={isPlaceholderData}
                                                settings={settings}
                                            />
                                        );
                                    }}
                                />
                                <Route
                                    render={() => (
                                        <Result
                                            status="404"
                                            title={404}
                                            subTitle={t("pages.notFound")}
                                            extra={
                                                <Button type="primary" onClick={() => history.goBack()}>
                                                    {t("pages.goBack")}
                                                </Button>
                                            }
                                        />
                                    )}
                                />
                            </Switch>
                        </>
                    );
                }}
            />
            <Redirect to="/tasks/schedule" />
        </Switch>
    );
});
