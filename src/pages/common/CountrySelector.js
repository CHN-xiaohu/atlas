import {Select, Space} from "antd";
import {FlagMaker} from "./EditableFields";
import countries from "../../data/countries.json";
import {getCountryCode} from "../../data/countries";
import { memo } from "react";
import {useTranslation} from "react-i18next";

export const CountrySelector = memo(({value, onChange, stats}) => {
    const {t} = useTranslation();
    return (
        <Select style={{minWidth: "200px"}} value={value ?? null} showSearch onChange={country => onChange(country)}>
            <Select.Option value={null}>
                <Space>
                    <FlagMaker country="UN" />
                    <span>
                        {t("common.allCountries")}
                        {stats != null && <span> ({Object.values(stats).reduce((a, b) => a + b, 0)})</span>}
                    </span>
                </Space>
            </Select.Option>
            {stats != null && (stats.noCountry > 0 || value === "noCountry") && (
                <Select.Option value={"noCountry"}>
                    <Space>
                        <FlagMaker country="eu" />
                        <span>
                            {t("common.noCountries")} ({stats.noCountry})
                        </span>
                    </Space>
                </Select.Option>
            )}
            {Object.keys(countries).map(country => (
                <Select.Option key={country} value={country}>
                    <Space>
                        <FlagMaker country={getCountryCode(country)} />

                        <span>
                            {country}
                            {stats != null && <span> ({stats[country] ?? 0})</span>}
                        </span>
                    </Space>
                </Select.Option>
            ))}
        </Select>
    );
});
