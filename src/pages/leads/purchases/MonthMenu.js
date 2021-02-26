import moment from "moment";
import { memo, useCallback } from "react";
import {Button, DatePicker, Space} from "antd";
import {useRouteMatch, useHistory} from "react-router-dom";
import {LeftOutlined, RightOutlined} from "@ant-design/icons";
import styled from "styled-components";

const Container = styled.div`
    margin-bottom: 1rem;
`;

const ButtonWithoutOutline = styled(Button)`
    &:focus {
        border-color: #d9d9d9 !important;
        color: rgba(0, 0, 0, 0.85) !important;
    }
`;

const Tail = memo(({count, onClick, reverse = false, date = moment()}) => {
    const tailArray = new Array(count).fill(0);
    return (
        <Button.Group>
            {tailArray.map((el, i) => {
                const month = date.clone().add(reverse ? -count + i : i + 1, "month");
                const isAfter = moment(month).isAfter(moment(moment().format("YYYY-MM")));
                return  !isAfter ? (
                    <ButtonWithoutOutline key={i} onClick={() => onClick(month)}>
                        {month.format("MMMM")}
                    </ButtonWithoutOutline>
                ) : null;
            })}
        </Button.Group>
    );
});

export const MonthMenu = memo(({module, style, tail = 3, replace = true}) => {
    const match = useRouteMatch(`/${module}/:year/:month/:day?`);
    const params = match?.params;
    const date = moment({month: params?.month - 1, year: params?.year, day: params?.day});
    const history = useHistory();
    const handleChange = useCallback(
        date =>
            history[replace ? "replace" : "push"](
                `/${module}/${date.format(params?.day == null ? "YYYY/MM" : "YYYY/M/D")}`,
            ),
        [history, module, params, replace],
    );
    const isSameOrAfter = date.isSameOrAfter(moment(moment().format("YYYY-MM")));
    return (
        <Container style={style}>
            <Space>
                <Tail date={date} count={tail} onClick={handleChange} reverse={true} />
                <LeftOutlined style={{cursor: "pointer"}} onClick={() => handleChange(date.add(-1, "month"))} />
                <DatePicker
                    picker="month"
                    value={date}
                    format="MMMM YYYY"
                    style={{width: "160px"}}
                    onChange={handleChange}
                />
                {!isSameOrAfter && <RightOutlined style={{cursor: "pointer"}} onClick={() => handleChange(date.add(1, "month"))} />}
                <Tail date={date} count={tail} onClick={handleChange} />
            </Space>
        </Container>
    );
});
