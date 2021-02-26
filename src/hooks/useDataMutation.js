import {useMutation} from "react-query";
import {useRequest} from "./useRequest";

export const useDataMutation = (endpoint, config) => {
    const request = useRequest(endpoint);
    return useMutation(request, config)
}
