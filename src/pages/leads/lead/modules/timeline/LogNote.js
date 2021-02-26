import {memo} from "react";
import {Avatar, Space, Tag, Tooltip, Typography} from "antd";
import {
    EditOutlined,
    HistoryOutlined,
    BulbOutlined,
    RobotOutlined,
    PlusCircleOutlined,
    DeleteOutlined,
    DiffOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {fields} from "../../../../../data/leadFields";
import {Flex} from "../../../../../styled/flex";
import {color, contactName, getImageLink} from "../../../../../Helper";
import {parsePhoneNumberFromString} from "libphonenumber-js";
import {useQuery} from "react-query";
import {useTranslation} from "react-i18next";

const {Text} = Typography;

const TextLog = memo(({icon, children}) => {
    return (
        <Typography>
            <Space>
                {icon}
                <span>{children}</span>
            </Space>
        </Typography>
    );
});
const StatusTag = memo(({color: c, colorLevel, name}) => {
    const {t} = useTranslation();
    return (
        <Tag style={{margin: "0 5px"}} color={color(c, colorLevel)}>
            {t(name)}
        </Tag>
    );
});
const StatusChange = memo(({from, to, ...props}) => {
    const {data: pipelines} = useQuery(["pipelines"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const {t} = useTranslation();
    return (
        <TextLog {...props}>
            {t("leads.statusChanged")} <StatusTag {...pipelines.find(p => p.id === from)} /> =>
            <StatusTag {...pipelines.find(p => p.id === to)} />
        </TextLog>
    );
});

const specialCases = key => {
    if (key === "arrivalDate") {
        return "Arrival date";
    } else if (key === "departureDate") {
        return "Departure date";
    }
};

const format = value => {
    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    } else if (typeof value === "number") {
        const string = value.toString().includes("+") ? value.toString() : `+${value}`;
        const parsed = parsePhoneNumberFromString(string);
        if (parsed != null && parsed.isValid()) {
            return parsed.formatInternational();
        }
    } else if (typeof value === "string") {
        if (moment(value, moment.ISO_8601, true).isValid()) {
            return moment(value).format("DD MMMM YYYY");
        }
        return value;
    } else if (typeof value === "object") {
        return JSON.stringify(value);
    }
    return value;
};

const ValueFormatter = memo(({children}) => {
    return <Text strong>{format(children)}</Text>;
});

export const ContactLog = memo(({event, time, attribute, val, oldVal, contact}) => {
    const {t} = useTranslation();
    const contactShowName = contactName(contact);

    if (event === "contact.add") {
        return (
            <TextLog time={time} icon={<EditOutlined />}>
                <Text strong>
                    {t("leads.createAContactMethod")} ({contactShowName})
                </Text>
            </TextLog>
        );
    } else if (event === "contact.change") {
        return (
            <TextLog time={time} icon={<EditOutlined />}>
                <Text strong>
                    {t("leads.modifyTheContactMethod")} ({contactShowName}&nbsp;
                    {t("leads.de")}&nbsp;
                    {attribute})
                </Text>
                &nbsp;{t("leads.from")}&nbsp;
                <ValueFormatter>{oldVal}</ValueFormatter> {t("leads.converted")}&nbsp;
                <ValueFormatter>{val}</ValueFormatter>
            </TextLog>
        );
    } else if (event === "contact.delete") {
        return (
            <TextLog time={time} icon={<EditOutlined />}>
                <Text strong>
                    {t("leads.removeContactMethod")} ({contactShowName})
                </Text>
            </TextLog>
        );
    }
});

const LeadLog = memo(({event, author, time, ...props}) => {
    const {t} = useTranslation();
    const leadFields = fields([], {}, [], t);

    if (event.startsWith("contact.")) return <ContactLog event={event} time={time} {...props} />;

    if (event === "add") {
        return (
            <Typography>
                <Space>
                    <HistoryOutlined />
                    <span>
                        {t("leads.created")} {time.format("DD MMMM YYYY HH:mm")} ({time.fromNow()})
                    </span>
                </Space>
            </Typography>
        );
    } else if (event === "merge") {
        return (
            <TextLog time={time} icon={<DiffOutlined />}>
                {props.source} {t("leads.hasBeenMergedInto")} {props.target}
            </TextLog>
        );
    } else if (event === "change") {
        if (props.field === "status_id") {
            return <StatusChange icon={<BulbOutlined />} from={props.oldValue} to={props.newValue} />;
        }
        const field = specialCases(props.field) ?? leadFields.find(f => f.key === props.field)?.label ?? props.field;
        if (props.oldValue == null) {
            return (
                <TextLog time={time} icon={<PlusCircleOutlined />}>
                    {t("leads.property")} <Text strong>{field}</Text> {t("leads.setTo")}
                    <ValueFormatter>{props.newValue}</ValueFormatter>
                </TextLog>
            );
        }
        if (props.newValue == null) {
            return (
                <TextLog time={time} icon={<DeleteOutlined />}>
                    {t("leads.property")} <Text strong>{field}</Text> {t("leads.value")}
                    <ValueFormatter>{props.oldValue}</ValueFormatter> {t("leads.wasRemoved")}.
                </TextLog>
            );
        }
        return (
            <TextLog time={time} icon={<EditOutlined />}>
                {t("leads.property")} <Text strong>{field}</Text> {t("leads.changedFrom")}
                <ValueFormatter>{props.oldValue}</ValueFormatter> {t("leads.to")}
                <ValueFormatter>{props.newValue}</ValueFormatter>
            </TextLog>
        );
    }
    return null;
});

export const AuthorBadge = memo(({login, time}) => {
    const {data: users} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const user = users.find(u => u.login === login);
    const name = user?.name ?? login;
    return (
        <Space>
            {time && <Tooltip title={time.fromNow()}>{time.format("DD MMMM YYYY HH:mm")}</Tooltip>}
            {login === "system" ? (
                <RobotOutlined />
            ) : (
                user && (
                    <Tooltip title={name}>
                        <Avatar src={getImageLink(user?.avatar, "avatar_webp", user?.session)} size="small" />
                    </Tooltip>
                )
            )}
        </Space>
    );
});

export const LogNote = memo(({entity: type, time: created_at, author, ...note}) => {
    const time = moment(created_at);

    if (type === "lead") {
        return (
            <Flex justifyBetween>
                <LeadLog {...note} time={time} />
                <AuthorBadge login={author} time={time} />
            </Flex>
        );
    }
    return null;
});
