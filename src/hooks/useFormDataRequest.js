import {formdata, request} from "../Helper";
import {useMemo} from "react";

export const useFormDataRequest = endpoint => {
    return useMemo(() => {
        if (endpoint == null || typeof endpoint !== "string") {
            return (url, data) => request(url, data, formdata);
        } else {
            return data => request(`https://api.globus.furniture${endpoint}`, data, formdata);
        }
    }, [endpoint]);
};
