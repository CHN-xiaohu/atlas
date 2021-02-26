import {memo} from "react";
import styled from "styled-components";
import {Tag} from "antd";
import {color} from "../../../Helper";
import {useQuery} from "react-query";
import {useTranslation} from "react-i18next";
const {CheckableTag} = Tag;

const CheckablePipeline = styled(CheckableTag)`
    &.ant-tag-checkable-checked {
        background-color: ${props => props.color} !important;
    }
`;

export const StatusSelector = memo(({value = [], onChange}) => {
    const {data: pipelines} = useQuery(["pipelines"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const {t} = useTranslation();
    return pipelines.map(pipeline => (
        <CheckablePipeline
            onChange={checked => {
                if (checked) {
                    onChange([...value, pipeline.id]);
                } else {
                    onChange(value.filter(status => status !== pipeline.id));
                }
            }}
            checked={value.includes(pipeline.id)}
            key={pipeline._id}
            color={color(pipeline.color, pipeline.colorLevel)}
        >
            {t(pipeline.name)}
        </CheckablePipeline>
    ));
});
