import {Avatar, Space, Tag, Tooltip} from "antd";
import {validateEmail, color, salesManager, getImageLink} from "../Helper";
import countries from "./countries.json";
import {getCountryCode} from "./countries";
import {FlagMaker} from "../pages/common/EditableFields";
import moment from "moment";
import {LockOutlined} from "@ant-design/icons";
import {StyledCountdown} from "../pages/leads/lead/ActiveTasks";
import {ActiveUsers} from "../pages/common/ActiveUsers";

const from = (pipelines, status) =>
    pipelines
        .filter(p => p.id !== 143)
        .reduce((r, cur) => {
            if (cur.id === status || r.length > 0) {
                r.push(cur.id);
            }
            return r;
        }, []);

const sources = t => {
    return [
        {
            label: t("leadFields.options.sources.label.jivosite"),
            value: "jivosite",
        },
        {
            label: t("leadFields.options.sources.label.email"),
            value: "mail",
        },
        {
            label: t("leadFields.options.sources.label.phone"),
            value: "phone",
        },
        {
            label: t("leadFields.options.sources.label.yandex"),
            value: "yandex",
        },
        {
            label: t("leadFields.options.sources.label.google"),
            value: "google",
        },
        {
            label: t("leadFields.options.sources.label.recommendation"),
            value: "recommendation",
        },
        {
            label: t("leadFields.options.sources.label.globusChinaCom"),
            value: "globus-china.com",
        },
        {
            label: t("leadFields.options.sources.label.globusWorld"),
            value: "globus.world",
        },
        {
            label: t("leadFields.options.sources.label.globusFurnitureCom"),
            value: "globus-furniture.com",
        },
        {
            label: t("leadFields.options.sources.label.globusFurnitureRu"),
            value: "globus-furniture.ru",
        },
        {
            label: t("leadFields.options.sources.label.mlchinaRu"),
            value: "mlchina.ru",
        },
        {
            label: t("leadFields.options.sources.label.whatsapp"),
            value: "whatsapp",
        },
        {
            label: t("leadFields.options.sources.label.instagram"),
            value: "instagram",
        },

        {
            label: t("leadFields.options.sources.label.facebook"),
            value: "facebook",
        },
        {
            label: t("leadFields.options.sources.label.viber"),
            value: "viber",
        },
        {
            label: t("leadFields.options.sources.label.taplink"),
            value: "taplink",
        },
        {
            label: t("leadFields.options.sources.label.manual"),
            value: "manual",
        },
        {
            label: t("leadFields.options.sources.label.youtube"),
            value: "youtube",
        },
        {
            label: t("leadFields.options.sources.label.others"),
            value: "others",
        },
    ];
};

export const fields = (pipelines, client, users = [], t) => [
    {
        label: t("leadFields.label.responsibleManager"),
        type: "select",
        key: "responsible",
        allowEmpty: true,
        options: users
            .filter(user => salesManager(user))
            .map(user => ({
                label: (
                    <Space>
                        <Avatar size="small" src={getImageLink(user?.avatar, "avatar_webp", user?.session)} />
                        {user.name ?? user.login}
                    </Space>
                ),
                value: user.login,
            })),
        readOnly: (group, user) => user?.access?.leads?.canEditLeads,
    },
    {
        label: t("leadFields.label.tags"),
        type: "tags",
        key: "tags",
    },
    {
        label: t("leadFields.label.status"),
        type: "select",
        key: "status_id",
        options: pipelines
            .filter(pipeline => !pipeline.disabled)
            .sort((p1, p2) => p1.sort - p2.sort)
            .map(pipeline => {
                const deadline = moment(client.created_at).add(pipeline.requiredAge ?? 0, "days");
                const underage = deadline.isAfter(moment());
                return {
                    label: (
                        <Tooltip
                            title={
                                underage ? (
                                    <StyledCountdown
                                        style={{color: "white"}}
                                        value={deadline}
                                        format="D [days] H [hours] m [minutes] s [seconds left]"
                                    />
                                ) : null
                            }
                        >
                            <Space>
                                {underage && <LockOutlined />}
                                {t(pipeline.name)}
                            </Space>
                        </Tooltip>
                    ),
                    value: pipeline.id,
                    disabled: pipeline.disabled || underage,
                };
            }),
        renderPreview: value => {
            const pipeline = pipelines.find(p => p.id === value) || {};
            return <Tag color={color(pipeline.color, pipeline.colorLevel)}>{t(pipeline.name)}</Tag>;
        },
        defaultValue: 2,
    },
    {
        label: t("leadFields.label.budget"),
        type: "money",
        key: "price",
        defaultValue: 0,
        warn: data => {
            //from good green clients
            return from(pipelines, 23674579).includes(data.status_id) && (data.price == null || data.price === 0);
        },
    },
    {
        label: t("leadFields.label.country"),
        key: "country",
        type: "select",
        options: Object.keys(countries).map(country => {
            const code = getCountryCode(country);
            return {
                label: (
                    <Space>
                        <FlagMaker country={code} size="lg" />
                        {country}
                    </Space>
                ),
                value: country,
            };
        }),
        renderPreview: country => {
            const code = getCountryCode(country);
            return (
                <Space>
                    <FlagMaker country={code} size="lg" />
                    {country}
                </Space>
            );
        },
        warn: data => {
            return from(pipelines, 22283386).includes(data.status_id) && data.country == null;
        },
        params: {
            showSearch: true,
        },
    },
    {
        label: t("leadFields.label.city"),
        key: "city",
        type: "select",
        options:
            [...new Set(countries[client?.country])].map(city => {
                return {
                    label: city,
                    value: city,
                };
            }) ?? [],
        params: {
            showSearch: true,
            disabled: client?.country == null,
        },
        warn: data => {
            return from(pipelines, 22283386).includes(data.status_id) && data.city == null;
        },
        readOnly: (group, user) => client?.country == null && user?.access?.leads?.canEditLeads,
    },
    {
        label: t("leadFields.label.propertyType"),
        type: "select",
        key: "propertyType",
        warn: data => {
            //from good green clients
            return from(pipelines, 23674579).includes(data.status_id) && data.propertyType == null;
        },
        options: [
            {
                label: t("leadFields.options.label.house"),
                value: "Дом",
            },
            {
                label: t("leadFields.options.label.apartment"),
                value: "Квартира",
            },
            {
                label: t("leadFields.options.label.aRestaurant"),
                value: "Ресторан",
            },
            {
                label: t("leadFields.options.label.hotel"),
                value: "Отель",
            },
            {
                label: t("leadFields.options.label.office"),
                value: "Офис",
            },
            {
                label: t("leadFields.options.label.bar"),
                value: "Бар",
            },
            {
                label: t("leadFields.options.label.beautySaloon"),
                value: "Салон красоты",
            },
            {
                label: t("leadFields.options.label.score"),
                value: "Магазин",
            },
            {
                label: t("leadFields.options.label.business"),
                value: "Бизнес",
            },
            {
                label: t("leadFields.options.label.yacht"),
                value: "Яхта",
            },
            {
                label: t("leadFields.options.label.other"),
                value: "Другое",
            },
        ],
    },
    {
        label: t("leadFields.label.propertySize"),
        key: "propertySize",
        type: "square",
        defaultValue: 0,
    },
    {
        label: t("leadFields.label.russianSpeaking"),
        key: "russianSpeaking",
        type: "switch",
        defaultValue: false,
    },
    {
        label: t("leadFields.label.onlineOrder"),
        key: "online",
        type: "switch",
        defaultValue: false,
    },
    {
        label: t("leadFields.label.paidTheDeposit"),
        key: "paidDeposit",
        type: "switch",
        defaultValue: false,
    },
    {
        label: t("leadFields.label.source"),
        key: "source",
        type: "select",
        options: sources(t),
        warn: data => {
            return data.connection === "Telegram" && data.telegram == null;
        },
        renderPreview: value => {
            const option = sources(t).find(source => source.value === value);
            if (option) {
                return option.label;
            } else return `!${value}!`;
        },
        readOnly: (group, user) => user?.access?.leads?.canEditLeads,
    },
    {
        label: t("leadFields.label.orderTime"),
        key: "orderDate",
        tooltip: "Date of deposit funds transfer",
        type: "date",
        params: {
            picker: "month",
        },
        renderPreview: v => moment(v).format("MMMM YYYY"),
        hidden: client?.orderDate == null,
        readOnly: () => true,
        warn: () => true,
    },
    {
        label: t("leadFields.label.shoppingTime"),
        key: "shoppingTime",
        keys: ["arrivalDate", "departureDate"],
        type: "datarange",
        warn: data => {
            //from good determined with dates
            return (
                from(pipelines, 20674288).includes(data.status_id) &&
                (data.arrivalDate == null || data.departureDate == null)
            );
        },
        hidden: client?.online,
    },
    {
        label: t("leadFields.label.managers"),
        key: "managers",
        type: "select",
        params: {
            mode: "multiple",
        },
        warn: data => {
            //from good green clients
            return (
                from(pipelines, 20674288).includes(data.status_id) &&
                !(Array.isArray(data.managers) && data.managers.length > 0)
            );
        },
        options: users
            .filter(
                m =>
                    typeof m.title === "string" &&
                    m.title.includes("manager") &&
                    m.active &&
                    (client.russianSpeaking || !m.onlyRussian),
            )
            .map(manager => ({
                key: manager.login,
                label: (
                    <Space>
                        <Avatar size="small" src={getImageLink(manager?.avatar, "avatar_webp", manager?.session)} />
                        {manager.name}
                    </Space>
                ),
                value: manager.login,
                sign: "!",
            })),
        renderPreview: value => {
            if (!Array.isArray(value) || value.length === 0) {
                return "…";
            }
            return <ActiveUsers users={users.filter(user => value.includes(user.login))} />;
        },
        readOnly: (group, user) => user?.access?.leads?.canEditLeads,
    },
    {
        label: t("leadFields.label.doNotDisturbTill"),
        key: "doNotDisturbTill",
        type: "date",
    },
];

// const phoneIsEmpty = data => data.phone == null || data.phone === "";
const emailIsEmpty = data => data.email == null || data.email === "";

export const contactFields = t => [
    {
        label: t("leadFields.label.contactName"),
        key: "contact_name",
        type: "text",
    },
    {
        label: t("leadFields.label.phone"),
        key: "phone",
        type: "contact",
        // warn: data => emailIsEmpty(data) && phoneIsEmpty(data),
    },
    {
        label: t("leadFields.label.email"),
        key: "email",
        type: "text",
        // warn: data => {
        //     if (emailIsEmpty(data)) {
        //         return phoneIsEmpty(data) && emailIsEmpty(data);
        //     } else {
        //         return !validateEmail(data.email) ? true : phoneIsEmpty(data) && emailIsEmpty(data);
        //     }
        // },
        warn: data => !emailIsEmpty(data) && !validateEmail(data.email),
    },
    {
        label: t("leadFields.label.whatsApp"),
        key: "whatsapp",
        type: "contact",
    },
    {
        label: t("leadFields.label.wechat"),
        key: "wechat",
        type: "contact",
    },
    {
        label: t("leadFields.label.viber"),
        key: "viber",
        type: "contact",
    },
    {
        label: t("leadFields.label.telegram"),
        key: "telegram",
        type: "contact",
    },
    {
        label: t("leadFields.label.address"),
        key: "address",
        type: "text",
    },
];
