import {memo} from "react";
import {Content as ContentPureUI} from "../Content";
import {useQueryClient} from "react-query";
import {useDataMutation} from "hooks/useDataMutation";

const defaultFunc = () => {};
export const Content = memo(({onUpdate = defaultFunc, ...props}) => {
    const queryClient = useQueryClient();
    const {mutate: updateQuotationItem} = useDataMutation("/newQuotationItems/update", {
        onSuccess: () => {
            queryClient.invalidateQueries("newQuotationItems");
        },
    });

    const handleUpdate = async (e) => {
        const {key, value, oldQuotationItem} = e;
        await updateQuotationItem({
            _id: oldQuotationItem._id,
            key,
            val: value
        })
        onUpdate(e);
    };

    return (
        <ContentPureUI
            {...props}
            onUpdate={handleUpdate}
        />
    )
})
