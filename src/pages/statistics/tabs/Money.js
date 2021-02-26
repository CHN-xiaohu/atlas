import {Button, Col, DatePicker, Space} from "antd";
import { memo } from "react";
import {extendMoment} from "moment-range";
import Moment from "moment";
import {StatusSelector} from "../common/StatusSelector";
import {CountrySelector} from "../../common/CountrySelector";
import {useImmer} from "../../../hooks/useImmer";
import {useTranslation} from "react-i18next";

const {RangePicker} = DatePicker;
const moment = extendMoment(Moment);

export const Money = memo(() => {
    const [params, patchParams] = useImmer({
        statuses: [142],
        from: moment().add(-1, "year"),
        to: moment(),
    });

    const {t} = useTranslation();
    return (
        <>
            <Col span={24}>
                <Space>
                    <Button
                        onClick={() =>
                            patchParams(draft => {
                                draft.from = moment().subtract(3, "month").startOf("month");
                                draft.to = moment().endOf("month");
                            })
                        }
                    >
                        {t("statistics.last3Months")}
                    </Button>
                    <Button
                        onClick={() =>
                            patchParams(draft => {
                                draft.from = moment().subtract(1, "year").startOf("month");
                                draft.to = moment().endOf("month");
                            })
                        }
                    >
                        {t("statistics.lastYear")}
                    </Button>
                    <RangePicker
                        allowClear={false}
                        value={[params.from, params.to]}
                        onChange={period =>
                            patchParams(draft => {
                                draft.from = period[0];
                                draft.to = period[1];
                            })
                        }
                        picker="month"
                        format="MMMM YYYY"
                    />
                    <CountrySelector
                        value={params.country}
                        onChange={country =>
                            patchParams(draft => {
                                draft.country = country;
                            })
                        }
                    />
                </Space>
            </Col>
            <Col span={24}>
                <StatusSelector
                    value={params.statuses}
                    onChange={statuses =>
                        patchParams(draft => {
                            draft.statuses = statuses;
                        })
                    }
                />
            </Col>
        </>
    );
});
