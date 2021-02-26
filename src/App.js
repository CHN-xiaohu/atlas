import {memo, useEffect, Suspense} from "react";
import {ConfigProvider} from "antd";
import {BrowserRouter as Router, Route, Redirect, Switch} from "react-router-dom";
import {router} from "./router";
import {Layout} from "./markup/Layout";
import {LoginPage} from "./pages/LoginPage";
import "./i18n";
import {LimitedView} from "./pages/common/LimitedView";
import {useTranslation} from "react-i18next";
import i18next from "i18next";
import {ErrorBoundary} from "./pages/common/ErrorBoundary";
import {useGlobalState} from "./hooks/useGlobalState";
import {Spinner} from "./pages/common/Spinner";
import {AccessDenied} from "./errors/AccessDenied";
import {NotFound} from "./errors/NotFound";
import zhCN from 'antd/lib/locale/zh_CN';
import enGB from "antd/lib/locale/en_GB";
import ruRU from  "antd/lib/locale/ru_RU";

const ComponentWrapper = memo(({component: Component, name, path, ...props}) => {
    const {t} = useTranslation();
    useEffect(() => {
        document.title = `${t(name)} @ Atlas`;
    }, [name, t]);
    return (
        <ErrorBoundary>
            <Component {...props} />
        </ErrorBoundary>
    );
});

export const localeMap = {
    ru: ruRU,
    en: enGB,
    zh: zhCN,
}

const ApplicationRouting = memo(() => {
    const [user] = useGlobalState("user");
    const notLoggedIn = user?.session == null;
    //const {pathname} = useLocation();
    console.log('app routing rerender');
    return (
        <Layout>
            <Switch>
                <Route path="/login" component={LoginPage} />
                {notLoggedIn && (
                    <Redirect
                        push
                        // to={{
                        //     pathname: `/login`,
                        //     search: `?from=${pathname}`,
                        // }}
                        to="/login"
                    />
                )}
                {router.map(({path, component, props, name, accessLevel}) => (
                    <Route
                        key={path}
                        path={`/${path}`}
                        render={({history}) => {
                            return (
                                <LimitedView groups={[accessLevel]} no={<AccessDenied history={history} />}>
                                    <Suspense fallback={<Spinner />}>
                                        <ComponentWrapper component={component} name={name} path={path} {...props} />
                                    </Suspense>
                                </LimitedView>
                            );
                        }}
                    />
                ))}
                <Redirect push exact from="/" to={`/${router[0].path}`} />
                <Route render={({history}) => <NotFound history={history} />} />
            </Switch>
        </Layout>
    );
});

export const App = memo(() => {
    return (
        <ConfigProvider locale={localeMap[i18next.language]}>
            <Router>
                <ApplicationRouting />
            </Router>
        </ConfigProvider>
    );
});
