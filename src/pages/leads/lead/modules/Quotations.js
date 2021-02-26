import { memo } from "react";
import {AddQuotationModal} from "./quotations/AddQuotationModal";
import {useHistory} from "react-router-dom";
import {useToggle} from "../../../../hooks/useToggle";
import {useLocalStorage} from "@rehooks/local-storage";
import {QuotationsList} from "../../../products/quotations/QuotationsList";
import {Button, Row, Col} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import {useQuery} from "react-query";
import {useTranslation} from "react-i18next";
import {LimitedView} from "../../../common/LimitedView";

export const Quotations = memo(({lead}) => {
    const [, setActiveQuotation] = useLocalStorage("shopping-cart-quotation");

    const {data: quotations, isPlaceholderData} = useQuery(
        [
            "quotations",
            {
                method: "forLeads",
                leads: [lead._id],
            },
        ],
        {
            placeholderData: [],
        },
    );

    const [adding, setAdding] = useToggle(false);
    const history = useHistory();
    const {t} = useTranslation();
    return (
        <Row gutter={[12, 12]}>
            <Col span={24}>
                <QuotationsList
                    loading={isPlaceholderData}
                    onSelect={_id => {
                        setActiveQuotation(_id);
                        history.push("/products");
                    }}
                    data={quotations ?? []}
                    onAdd={() => setAdding(true)}
                />
            </Col>
            <Col span={24}>
                <LimitedView groups={[(g, user) => user?.access?.products?.canAddQuotations]}>
                    <Button icon={<PlusOutlined />} size="large" type="primary" onClick={() => setAdding(true)}>
                        {t("leads.add")}
                    </Button>
                </LimitedView>

                {adding && <AddQuotationModal lead={lead._id} visible={adding} onClose={() => setAdding(false)} />}
            </Col>
        </Row>
    );
});
