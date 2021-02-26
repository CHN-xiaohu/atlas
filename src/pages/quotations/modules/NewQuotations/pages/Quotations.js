import { memo } from "react";
import {Entry} from "../components/quotations/Entry";

export const Quotations = memo(({lead, routeProps}) => {
    const {history} = routeProps;

    const onSelectQuotation = () => {
        history.push("/products");
    }

    return (
        <Entry lead={lead} onSelectQuotation={onSelectQuotation} />
    );
});
