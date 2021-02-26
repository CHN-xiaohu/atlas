import {memo, useState} from "react";
import {
    Cascader,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Rate,
    Select,
    Space,
    Switch,
    Tag,
    Tooltip,
    Typography,
    Radio,
    AutoComplete,
} from "antd";
import styled from "styled-components";
import {dollars, showDataRange, smooth, color, usd} from "../../Helper";
import moment from "moment";
import {parsePhoneNumberFromString} from "libphonenumber-js";
import {getCountryName} from "../../data/countries";
import districts from "../../data/districts.json";
import {FlagIcon as Flag} from "./Flag";
import {Flex} from "../../styled/flex";
import {DollarCircleFilled} from "@ant-design/icons";
import {CompatiblePictureWall} from "pages/common/PictureWall";
import Linkify from "linkifyjs/react";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "../../hooks/useGlobalState";
import {ButtonsMenu} from "./ButtonsMenu";
import {useSocketStorage} from "../../hooks/useSocketStorage";
import {useInnerState} from "hooks/useInnerState";
import {equals} from "ramda";

const {Option} = Select;
const {RangePicker} = DatePicker;
const {Text} = Typography;
const {CheckableTag} = Tag;

const Item = styled(Form.Item)`
    margin-bottom: ${props => props.margin ?? "0.8rem"} !important;
`;

const ContainerPreview = styled.div`
    min-height: 1rem;
    padding-left: 4px;
    border: 1px solid white;
    border-radius: 4px;
    &:hover {
        border: 1px dashed ${props => (!props.editable ? "white" : "#d9d9d9")};
        border-radius: 4px;
    }
`;

const provinces = Object.keys(districts);
const places = provinces
    .map(province => {
        const cities = districts[province];
        if (Array.isArray(cities)) {
            return cities.map(city => {
                return province + city;
            });
        } else {
            return Object.keys(cities).map(city => {
                const dstcts = districts[province][city];
                return dstcts.map(district => {
                    return province + city + district;
                });
            });
        }
    })
    .flat(2);

const Editor = memo(
    ({
        value,
        values,
        type,
        options,
        onChange,
        allowEmpty,
        allowHalf,
        allowClear,
        params,
        beforeSave,
        valueModifier,
        ...props
    }) => {
        // eslint-disable-next-line immutable/no-let
        let editor;
        const [state, setState] = useInnerState(value, equals);
        if (type === "radio") {
            editor = (
                <Radio.Group
                    onChange={e => {
                        const value = e.target.value;
                        setState(value);
                        onChange(value);
                    }}
                    value={value}
                >
                    {options.map(option => (
                        <Radio key={option.value} value={option.value}>
                            {option.label}
                        </Radio>
                    ))}
                </Radio.Group>
            );
        } else if (type === "button") {
            editor = (
                <ButtonsMenu
                    options={options}
                    activeKey={value}
                    onChange={value => {
                        setState(value);
                        onChange(value);
                    }}
                />
            );
        } else if (type === "select") {
            editor = (
                <Select
                    autoFocus
                    defaultOpen
                    onBlur={() => {
                        const value = state === "null" ? null : state;
                        const option = options.find(option => option.value === value) || {};
                        onChange(state, option.id);
                    }}
                    value={state}
                    onChange={value => {
                        setState(value);
                    }}
                    {...params}
                >
                    {(allowEmpty
                        ? [
                              <Option key="empty" value="null">
                                  …
                              </Option>,
                          ]
                        : []
                    ).concat(
                        options.map(({value, label, ...others}) => (
                            <Option key={value} value={value} {...others}>
                                {label}
                            </Option>
                        )),
                    )}
                </Select>
            );
        } else if (type === "text" || type === "link") {
            editor = (
                <Input
                    autoFocus
                    value={state}
                    onChange={({target}) => {
                        setState(target.value)
                    }}
                    onBlur={() => onChange(state)}
                    {...params}
                />
            );
        } else if (type === "location") {
            editor = (
                <AutoComplete
                    autoFocus
                    backfill={true}
                    allowClear={true}
                    value={state}
                    options={places.map(place => ({
                        label: place,
                        value: place,
                    }))}
                    filterOption={(inputValue, option) => {
                        return option.value.includes(inputValue);
                    }}
                    onChange={value => {
                        console.log("target: ", value);
                        setState(value);
                    }}
                    onSelect={setState}
                    onBlur={() => {
                        state && onChange(state);
                    }}
                    {...params}
                />
            );
        } else if (type === "money" || type === "number") {
            editor = (
                <InputNumber
                    value={typeof valueModifier === "function" ? valueModifier(state) : state}
                    style={{width: "100%"}}
                    onBlur={() => onChange(state)}
                    autoFocus
                    onChange={value => {
                        if (typeof beforeSave === "function") {
                            setState(beforeSave(value));
                        } else {
                            setState(value);
                        }
                    }}
                    formatter={type === "money" ? dollars : null}
                    {...params}
                />
            );
        } else if (type === "square") {
            const unit = params?.unit ?? "m²";
            editor = (
                <InputNumber
                    value={state}
                    style={{width: "100%"}}
                    onBlur={() => onChange(state)}
                    autoFocus
                    onChange={setState}
                    formatter={value => `${value} ${unit}`}
                    parser={str => str.replace(/[^\d.]/g, "")}
                />
            );
        } else if (type === "switch") {
            editor = (
                <Switch
                    checkedChildren={"Yes"}
                    unCheckedChildren={"No"}
                    checked={value}
                    onChange={value => onChange(value)}
                />
            );
        } else if (type === "datarange") {
            editor = (
                <RangePicker
                    value={values.map(value => {
                        const v = value == null ? moment() : moment(value);
                        return v.isValid() ? v : moment();
                    })}
                    autoFocus
                    allowClear
                    onChange={values => {
                        if (Array.isArray(values)) {
                            onChange(values.map(value => moment(value).toDate()));
                        } else {
                            onChange([null, null]);
                        }
                    }}
                />
            );
        } else if (type === "date") {
            const v = moment(value);
            editor = (
                <DatePicker
                    value={value != null && v.isValid() ? v : null}
                    autoFocus
                    allowClear
                    onChange={value => {
                        const v = moment(value).toDate();
                        onChange(!moment(v).isValid() ? undefined : v);
                    }}
                    {...params}
                />
            );
        } else if (type === "tags") {
            editor = (
                <Select
                    mode="tags"
                    style={{width: "100%"}}
                    allowClear
                    autoFocus
                    onBlur={() => {
                        onChange(state);
                    }}
                    onChange={tags => {
                        setState(tags);
                    }}
                    value={Array.isArray(state) ? state : []}
                />
            );
        } else if (type === "contact") {
            editor = (
                <Input
                    value={state}
                    style={{width: "100%"}}
                    onBlur={() => {
                        const value = state ?? "";
                        const string = value.toString().includes("+") ? value.toString() : `+${value}`;
                        const parsed = parsePhoneNumberFromString(string);
                        if (parsed != null) {
                            onChange(+(String(state)?.replace(/\D/g, "")));
                        } else {
                            onChange(state);
                        }
                    }}
                    autoFocus
                    onChange={({target}) => {
                        setState(target.value);
                    }}
                />
            );
        } else if (type === "rating") {
            editor = (
                <Rate
                    count={3}
                    value={state}
                    allowHalf={allowHalf}
                    allowClear={allowClear}
                    onChange={value => {
                        setState(value);
                        onChange(value);
                    }}
                />
            );
        } else if (type === "pricing") {
            editor = (
                <Rate
                    count={3}
                    value={state}
                    character={<DollarCircleFilled />}
                    style={{color: color("green")}}
                    allowClear={allowClear}
                    allowHalf={allowHalf}
                    onChange={value => {
                        setState(value);
                        onChange(value);
                    }}
                />
            );
        } else if (type === "tree") {
            editor = (
                <Cascader
                    value={state}
                    onBlur={() => onChange(state)}
                    onChange={value => setState(value)}
                    options={options}
                />
            );
        } else if (type === "images") {
            editor = (
                <CompatiblePictureWall
                    imageHeight="9rem"
                    uploadWidth="9rem"
                    uploadHeight="9rem"
                    files={value}
                    onChange={onChange}
                    {...params}
                />
            );
        } else if (type === "choice") {
            editor = (
                <div>
                    {(options ?? []).map((option, i) => {
                        const label = typeof option === "object" ? option.label : option;
                        const key = typeof option === "object" ? option.value : option;
                        return (
                            <CheckableTag
                                key={key}
                                checked={
                                    params?.multipleChoice
                                        ? (value ?? []).includes(key)
                                        : value === key || (i === 0 && value == null)
                                }
                                onChange={n => {
                                    const currentValue = Array.isArray(value) ? value : [];
                                    if (params?.multipleChoice) {
                                        if (currentValue.includes(key)) {
                                            onChange(currentValue.filter(o => o !== key));
                                        } else {
                                            onChange([...currentValue, key]);
                                        }
                                    } else {
                                        onChange(key);
                                    }
                                }}
                            >
                                {params?.showName ? label : i + 1}
                            </CheckableTag>
                        );
                    })}
                </div>
            );
        }
        return editor || type;
    },
);

export const FlagMaker = memo(({country, size = "lg", style}) => (
    <Tooltip title={getCountryName(country)}>
        <div style={{display: "inline-block", ...style}}>
            <Flag code={country?.toLowerCase()} size={size} />
        </div>
    </Tooltip>
));

export const treePreview = (keys = [], options) => {
    // eslint-disable-next-line immutable/no-let
    let lastStructure = options;
    return keys.map(key => {
        const option = lastStructure.find(o => o.value === key);
        lastStructure = option?.children;
        return option?.label;
    });
};

const Preview = memo(({type, value, values, options, onClick, renderPreview, readOnly, ...params}) => {
    const rates = useSocketStorage("forex");
    const {t} = useTranslation();
    const forex = usd(rates);
    // eslint-disable-next-line immutable/no-let
    let preview;
    if (type === "select") {
        if (typeof renderPreview === "function") {
            preview = renderPreview(value);
        } else {
            const option = options.find(option => option.value === value) || {};
            preview = option.label || "…";
        }
    } else if (type === "text") {
        preview = (
            <Text
                copyable={{
                    tooltips: value != null &&
                        typeof value === "string" &&
                        value.length > 0 && [t("common.copy"), t("common.copied")],
                }}
            >
                {value || "…"}
            </Text>
        );
    } else if (type === "money") {
        preview = <Tooltip title={dollars(smooth(value / forex), "$")}>{dollars(value)}</Tooltip>;
    } else if (type === "number") {
        if (typeof renderPreview === "function") {
            preview = renderPreview(value);
        } else {
            preview = typeof value;
        }
    } else if (type === "square") {
        const unit = params?.unit ?? (
            <>
                m<sup>2</sup>
            </>
        );
        preview = (
            <div>
                {value} {unit}
            </div>
        );
    } else if (type === "datarange") {
        preview = showDataRange(...values.map(value => (value != null ? moment(value) : moment.invalid())));
    } else if (type === "date") {
        if (typeof renderPreview === "function" && value) {
            preview = renderPreview(value);
        } else {
            preview = value ? moment(value).format("DD MMMM YYYY") : "…";
        }
    } else if (type === "tags") {
        preview = value != null && value.length > 0 ? value.map(tag => <Tag key={tag}>{tag}</Tag>) : "…";
    } else if (type === "location") {
        preview = value;
    } else if (type === "contact") {
        if (value == null || typeof value === "object") {
            preview = "…";
        } else {
            const string = value.toString().includes("+") ? value.toString() : `+${value}`;
            const parsed = parsePhoneNumberFromString(string);
            if (parsed != null) {
                const formatted = parsed.formatInternational();

                preview = (
                    <Flex alignCenter>
                        <Space>
                            {parsed.country && <FlagMaker country={parsed.country} />}
                            <Text copyable={{tooltips: [t("common.copy"), t("common.copied")]}}>{formatted}</Text>
                            {params?.CheckedWhatsapp && <params.CheckedWhatsapp phone={+(String(value)?.replace(/\D/g, ""))} />}
                        </Space>
                    </Flex>
                );
            } else {
                preview = (
                    <Text
                        copyable={{
                            tooltips: value != null &&
                                typeof value === "string" &&
                                value.length > 0 && [t("common.copy"), t("common.copied")],
                        }}
                    >
                        {value ?? "…"}
                    </Text>
                );
            }
        }
    } else if (type === "tree") {
        preview = (
            <Text copyable={{tooltips: value != null && value.length !== 0 && [t("common.copy"), t("common.copied")]}}>
                {treePreview(value, options).join(" / ")}
            </Text>
        );
    } else if (type === "link") {
        preview = (
            <div style={{display: "inline-block"}} onClick={e => e.stopPropagation()}>
                <Linkify
                    componentDecorator={(decoratedHref, decoratedText, key) => (
                        <a target="blank" href={decoratedHref} key={key}>
                            {decoratedText}
                        </a>
                    )}
                >
                    {value}
                </Linkify>
            </div>
        );
    }
    return (
        <ContainerPreview editable={!readOnly} onClick={onClick}>
            {preview || null}
        </ContainerPreview>
    );
});

export const EditableFields = memo(({columns = [], data = {}, onChange, margin, ...props}) => {
    const [editing, setEditing] = useState();
    const [user] = useGlobalState("user");
    const {t} = useTranslation();
    return (
        <Form {...props}>
            {columns
                .filter(field => !field.hidden)
                .map(field => {
                    const {label, key, type, keys = [], readOnly, tooltip, ...params} = field;
                    const value = data[key] ?? field.defaultValue;
                    const values = keys.map(key => data[key]);
                    const isEditing = editing === key;
                    const alwaysEditor = ["switch", "rating", "pricing", "images", "choice", "radio", "button"];
                    const needToWarn = typeof field.warn === "function" && field.warn(data);
                    const {deprecated} = field;
                    const onlyForRead = typeof readOnly != "function" ? readOnly : readOnly(user);
                    return (
                        <Item
                            margin={margin}
                            key={key}
                            label={
                                <Tooltip title={tooltip ?? (deprecated && t("common.nearFuture"))}>
                                    <Text delete={deprecated} style={{color: needToWarn && color("red")}}>
                                        {label}
                                    </Text>
                                </Tooltip>
                            }
                        >
                            {!onlyForRead && (isEditing || alwaysEditor.includes(type)) ? (
                                <Editor
                                    type={type}
                                    value={value}
                                    values={values}
                                    {...params}
                                    onChange={value => {
                                        if (Array.isArray(value) && keys.length > 0) {
                                            keys.forEach((key, i) => {
                                                onChange(key, value[i]);
                                            });
                                        } else {
                                            onChange(key, value);
                                        }
                                        setEditing(null);
                                    }}
                                />
                            ) : (
                                <Preview
                                    onClick={({target}) => {
                                        if (target.tagName !== "svg") {
                                            setEditing(key);
                                        }
                                    }}
                                    type={type}
                                    value={value}
                                    values={values}
                                    readOnly={onlyForRead}
                                    {...params}
                                />
                            )}
                        </Item>
                    );
                })}
        </Form>
    );
});
