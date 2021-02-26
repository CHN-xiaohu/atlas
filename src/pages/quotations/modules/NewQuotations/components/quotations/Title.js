import {memo} from "react";
import styled from "styled-components";
import {Space, Typography, Select, Button} from "antd";
import {SortAscendingOutlined, SortDescendingOutlined} from "@ant-design/icons";
import {Dot} from "pages/common/Dot";
import {Flex} from "styled/flex";
import {useTranslation} from "react-i18next";

const {Text} = Typography;
const {Option} = Select;

const TitleText = styled.h3`
    margin-bottom: 0;
`;

export const Title = memo(({color, title, quotationCount, sort, setSort, asc, toggleAsc}) => {
    const {t} = useTranslation();

    const handleSortChange = key => {
        setSort(key);
    };

    const handleToggleAsc = () => {
        toggleAsc(v => !v);
    };

    return (
        <Flex alignCenter>
            <Dot color={color} />
            <Flex style={{flex: "1"}} alignBaseline>
                <TitleText>{title}</TitleText>
                <Space style={{marginLeft: "auto"}} align="baseline">
                    <Text>
                        {quotationCount} {t("quotation.quotations")}
                    </Text>
                    <Select className="sort-select" value={sort} onChange={handleSortChange}>
                        <Option value="lastCreate">{t("quotation.newlyCreated")}</Option>
                        <Option value="lastUpdate">{t("quotation.latestModification")}</Option>
                    </Select>
                    <Button
                        icon={asc ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                        onClick={handleToggleAsc}
                    />
                </Space>
            </Flex>
        </Flex>
    );
});
