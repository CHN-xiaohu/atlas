import { memo, useState } from "react";
import {Col, Row, Checkbox} from "antd";
import {Route, Switch} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {UserPanel} from "./users/UserPanel";
import {Menu} from "./users/Menu";

export const Users = memo(() => {
    const [banned, setBanned] = useState(false);
    const onChange = e => {
        e.target.checked ? setBanned(false) : setBanned(null);
    };

    const {t} = useTranslation();
    return (
        <Row gutter={[24, 24]}>
            <Col span={6}>
                <Checkbox checked={banned === false} onChange={onChange}>
                    {t("pages.unbannedOnly")}
                </Checkbox>
                <Switch>
                    <Route
                        path="/users/:user?"
                        render={({match}) => {
                            const {user: current} = match.params;
                            return <Menu showBanned={banned} active={current} />
                        }}
                    />
                    {/*{users.length > 0 && <Redirect to={`/users/${users[0].login}`} />}*/}
                </Switch>
            </Col>
            <Col span={18}>
                <Switch>
                    <Route
                        path="/users/:user"
                        render={({match}) => {
                            const {user: current} = match.params;
                            return <UserPanel login={current} />;
                        }}
                    />
                    <Route
                        render={() => {
                            return t("pages.selectUser");
                        }}
                    />
                </Switch>
            </Col>
        </Row>
    );
});
