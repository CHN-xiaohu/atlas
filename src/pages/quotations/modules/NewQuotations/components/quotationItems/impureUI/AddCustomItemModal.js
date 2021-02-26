import {memo} from "react";
import {AddCustomItemModal as AddCustomItemModalPureUI} from "../AddCustomItemModal";
import {useDataMutation} from "hooks/useDataMutation";
import {useQueryClient} from "react-query";

export const AddCustomItemModal = memo(({quotationId, ...props}) => {
    const queryClient = useQueryClient();
    const {mutate: addQuotationItem} = useDataMutation("/newQuotationItems/addCustomization", {
        onSuccess: () => {
            queryClient.invalidateQueries("newQuotationItems");
        },
    });

    const handleOk = async quotationItem => {
        await addQuotationItem({
            quotationId,
            ...quotationItem,
        });
        await props.onOk();
    };

    return <AddCustomItemModalPureUI {...props} onOk={handleOk} />;
});
