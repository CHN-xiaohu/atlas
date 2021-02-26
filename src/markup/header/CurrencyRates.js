import {memo} from "react";
import {Space} from "antd";
import {Trend} from "./Trend";
import {smooth} from "../../Helper";
import {useSocketStorage} from "../../hooks/useSocketStorage";

export const CurrencyRates = memo(() => {
    const forex = useSocketStorage("forex");

    if (forex == null) {
        return "Error!!!";
    }

    return (
        <Space>
            <Space>
                <Trend value={forex.RUB?.value} previous={forex.RUB?.previous} />
                {smooth(forex.RUB?.value, 3)} ₽/¥
            </Space>
            <Space>
                <Trend
                    value={forex.RUB?.value / forex.USD?.value}
                    previous={forex.RUB?.previous / forex.USD?.previous}
                />
                {smooth(forex.RUB?.value / forex.USD?.value, 3)} ₽/$
            </Space>
            <Space>
                <Trend value={1 / forex.USD?.value} previous={1 / forex.USD?.previous} />
                {smooth(1 / forex.USD?.value, 3)} ¥/$
            </Space>
        </Space>
    );
});
