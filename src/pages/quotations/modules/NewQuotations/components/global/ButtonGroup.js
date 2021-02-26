import styled from "styled-components";
import {Flex} from "styled/flex";
import {useInnerState} from "hooks/useInnerState";
import {color} from "Helper";
import {insert, remove} from "ramda";

const Button = styled.div`
    padding: 4px;
    cursor: pointer;
    border-radius: 0;
    background-color: ${props=>props.active ? color("blue", 4) : "transparent" };
`;

/**
 * for example:
 * value: [1, 2, 3]
 * options: [{label: "label", value: 1}]
 */
export const ButtonGroup = ({value, options, onChange = (value) => {}}) => {
    const [innerValue, setInnerValue] = useInnerState(value);

    const onClick = ({value}, optionIndex) => {
        const valueIndex = innerValue.indexOf(value);
        const next = setInnerValue(innerValue => {
            if (valueIndex === -1) {
                return insert(optionIndex, value, innerValue)
            } else {
                return remove(valueIndex, 1, innerValue);
            }
        });
        onChange(next);
    }

    const isActive = (value) => {
        return innerValue.indexOf(value) !== -1;
    }

    return (
        <Flex wrap>
            {
                options.map((option, index) => (
                    <Button
                        key={option.value}
                        active={isActive(option.value)}
                        onClick={() => {onClick(option, index)}}
                    >
                        {option.label}
                    </Button>
                ))
            }
        </Flex>
    );
}
