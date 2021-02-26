import { memo } from "react";
import {Switch, Route} from "react-router-dom";
import {Quotations} from "./pages/Quotations";
import {QuotationItems} from "./pages/QuotationItems"

export const Router = memo(({lead}) => {
    return (
        <Switch>
            {/* quotation */}
            <Route
                exact
                path={`/leads/${lead._id}/new_quotations`}
                render={props => <Quotations lead={lead} routeProps={props} />}
            />
            {/* quotation item */}
            <Route
                exact
                path={`/leads/${lead._id}/new_quotations/:quotationId/:quotationItemId?`}
                render={props => <QuotationItems lead={lead} routeProps={props} />}
            />
        </Switch>
    );
});
