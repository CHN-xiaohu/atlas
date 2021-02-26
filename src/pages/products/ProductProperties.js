import {memo, useMemo} from "react";
import {Descriptions} from "antd";
import {EditableFields as OriginalEditableFields} from "../common/EditableFields";
import {BufferedTextArea} from "pages/common/BufferedTextArea";
import styled from "styled-components";
import {curry, compose, findIndex, remove, reverse, insert, dissoc} from "ramda";
import {color, maxItemOfArray} from "Helper";

const EditableFields = styled(OriginalEditableFields)`
    display: inline-block;
    width: 100%;

    .ant-typography-copy,
    .ant-form-item-label > label::after {
        display: none !important;
    }

    .ant-row {
        margin-bottom: 0 !important;
    }
`;

const DescriptionItemContent = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
`;

export const ProductPropertiesByColumns = memo(({columns, ...props}) => {
    const propertyMetadata = compose(
        standardize,
        group(["volume", "weight"]),
        group(["name", "englishName"]),
        group(["factoryTag", "set"]),
        sort([
            "category",
            "price",
            "name",
            "englishName",
            "factoryTag",
            "set",
            "size",
            "volume",
            "weight",
            "materials",
            "brand",
            "styles",
            "businesses",
            "rooms",
            "tags",
            "type",
            "shipping",
            "interest",
        ]),
    )(columns);

    return <ProductProperties propertyMetadata={propertyMetadata} {...props} />;
});

const getColumnsCount = propertyMetadata => {
    const groupLengths = propertyMetadata.map(group => group.length);
    return maxItemOfArray(groupLengths);
};

const defaultFunc = () => {};
export const ProductProperties = memo(
    ({
        propertyMetadata,
        product,
        onPropertyUpdate = defaultFunc, // ({key, value, oldProduct}) => {}
        className,
        style,
    }) => {
        const columnsCount = useMemo(() => getColumnsCount(propertyMetadata), [propertyMetadata]);

        const handleChange = (key, value) => {
            onPropertyUpdate({key, value, oldProduct: product});
        };

        return (
            <Descriptions column={columnsCount} size="small" bordered className={className} style={style}>
                {propertyMetadata.map(group =>
                    group.map(metaDatum => (
                        <Descriptions.Item
                            style={metaDatum.isDiff ? {backgroundColor: color("orange", 1)} : {}}
                            key={metaDatum.key}
                            label={metaDatum.label}
                            span={columnsCount - group.length + 1}
                        >
                            <DescriptionItemContent>
                                {metaDatum.type === "textarea" ? (
                                    <BufferedTextArea
                                        autoFocus={false}
                                        value={product[metaDatum.key]}
                                        placeholder={metaDatum.placeholder}
                                        onChange={value => handleChange(metaDatum.key, value)}
                                        rows={6}
                                    />
                                ) : (
                                    <EditableFields
                                        columns={[dissoc("label", metaDatum)]}
                                        data={product}
                                        onChange={handleChange}
                                    />
                                )}
                            </DescriptionItemContent>
                        </Descriptions.Item>
                    )),
                )}
            </Descriptions>
        );

        // return (
        //     <Wrapper className={className} style={style}>
        //         {propertyMetadata.map((group, index) => (
        //             <Row key={index}>
        //                 {group.map(metaDatum => (
        //                     metaDatum.type === "textarea"
        //                     ? (
        //                         <BufferedTextArea
        //                             key={metaDatum.key}
        //                             value={product.description}
        //                             placeholder={metaDatum.placeholder}
        //                             onChange={(value) => handleChange("description", value)}
        //                             rows={6}
        //                         />
        //                     )
        //                     : (
        //                         <EditableFields
        //                             key={metaDatum.key}
        //                             columns={[dissoc("label", metaDatum)]}
        //                             data={product}
        //                             onChange={handleChange}
        //                         />
        //                     )
        //                 ))}
        //             </Row>
        //         ))}
        //     </Wrapper>
        // );
    },
);

const group = curry((keys, columns) => {
    const {columns: finalColumns, group, lastIndex} = reverse(keys).reduce(
        ({columns, group, lastIndex}, key) => {
            const index = findIndex(column => column.key === key, columns);

            if (index === -1) return {columns, group, lastIndex};

            return {
                columns: remove(index, 1, columns),
                group: group.concat(columns[index]),
                lastIndex: index,
            };
        },
        {columns, group: [], lastIndex: null},
    );

    return insert(lastIndex, reverse(group), finalColumns);
});

const sort = curry((keys, columns) => {
    const {sortedColumns, remainColumns} = keys.reduce(
        ({sortedColumns, remainColumns}, key) => {
            const index = findIndex(column => column.key === key, remainColumns);

            if (index === -1) return {sortedColumns, remainColumns};

            return {
                sortedColumns: sortedColumns.concat(remainColumns[index]),
                remainColumns: remove(index, 1, remainColumns),
            };
        },
        {sortedColumns: [], remainColumns: columns},
    );

    return sortedColumns.concat(remainColumns);
});

const standardize = columns => {
    return columns.map(column => [].concat(column));
};
