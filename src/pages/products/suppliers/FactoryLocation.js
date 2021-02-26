import {Tag, Tooltip} from "antd";
import {memo} from "react";
import provinceAbbreviation from "../../../data/provinceAbbreviation.json";
import districts from "../../../data/districts.json";

export const colorMapping = {
    green: ["广东省佛山市顺德区", "广东省佛山市禅城区", "广东省佛山市南海区"],
    gold: ["广东省佛山市三水区", "广东省佛山市高明区", "广东省中山市"],
    orange: ["广东省肇庆市", "广东省清远市", "广东省东莞市", "广东省江门市", "广东省珠海市"],
    volcano: ["广东省惠州市", "广东省深圳市", "广东省河源市", "广东省韶关市"],
};

export const FactoryLocation = memo(({factories}) => {
    if (!Array.isArray(factories) || factories?.length === 0) return null;
    const factory = factories[0];
    if (factory == null) {
        return "";
    }
    const address = factory[Object.keys(factory).find(key => key.startsWith("location"))]; //找到地址

    const province = Object.keys(provinceAbbreviation).find(pro => address?.includes(pro)); //找到所在省份
    const city = Object.keys(districts["广东省"]).find(district => address?.includes(district)); //找到广东省中所在的市
    const dstct = districts["广东省"]["佛山市"].find(dstct => address?.includes(dstct)); //找到佛山市中所在的区
    const content =
        province != null && province !== "广东省"
            ? provinceAbbreviation[province]
            : province === "广东省" && city != null && city !== "佛山市"
            ? city
            : city === "佛山市"
            ? dstct
            : null;
    if (content == null) {
        return "";
    }
    const color =
        Object.keys(colorMapping).find(color => {
            return colorMapping[color].find(location => address.includes(location)) != null;
        }) ?? "red";
    return (
        <Tag color={color} style={{margin: 0}}>
            <Tooltip
                color="white"
                title={
                    <a rel="noreferrer" target="_blank" href={`https://www.google.com.hk/maps/search/${address}`}>
                        {address}
                    </a>
                }
            >
                {content.replace(/[区,市]/, "")}
            </Tooltip>
        </Tag>
    );
});
