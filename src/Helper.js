import {Fragment} from "react";
import {Tooltip, message} from "antd";
import Moment from "moment";
import {extendMoment} from "moment-range";
import styled from "styled-components";
import {presetPalettes} from "@ant-design/colors";
import {curry} from "ramda";

import {
    FileExcelOutlined,
    FileJpgOutlined,
    FileMarkdownOutlined,
    FilePdfOutlined,
    FilePptOutlined,
    FileTextOutlined,
    FileUnknownOutlined,
    FileWordOutlined,
    FileZipOutlined,
} from "@ant-design/icons";
import {isHoliday} from "china-holidays";

const moment = extendMoment(Moment);

export const label = (text, label) => {
    return <span className={`label ${label}`}>{text}</span>;
};

export const idRegex = "[a-f\\d]{24}";

export function isWorkingDay(day = moment(), ignoreHolidays = false) {
    if (!ignoreHolidays && isHoliday(day.toDate())) {
        return false;
    }
    return ![0, 6].includes(day.day());
}

export function nextWorkingDay(day = moment(), reverse = false) {
    const direction = reverse ? "subtract" : "add";
    const candidate = day.clone()[direction](1, "day");
    if (isWorkingDay(candidate)) {
        return candidate;
    }
    return nextWorkingDay(candidate.clone()[direction](1, "day"));
}

export function rateClient(client, dollarRate = 7) {
    if (client.price > 0.9 * dollarRate * 200000) {
        return 3;
    }
    if (client.price > 0.9 * dollarRate * 100000) {
        return 2;
    }
    if (client.price > 0.9 * dollarRate * 50000) {
        return 1;
    }
    return 0;
}

export const date = (timestamp, format = "fromNow") => {
    const m = !moment.isMoment(timestamp) ? new moment(timestamp) : timestamp;

    const absolute = m.format("DD.MM.YYYY HH:mm");
    const relative = m[format]();
    return <Tooltip title={absolute}>{relative}</Tooltip>;
};

export function type(def, obj) {
    // eslint-disable-next-line
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            if (obj[prop] === true) {
                return prop;
            }
        }
    }
    return def;
}

export function getFileIcon(file) {
    const ext = (file ?? "").split(".").pop();
    return (
        {
            pdf: FilePdfOutlined,
            txt: FileTextOutlined,
            xls: FileExcelOutlined,
            xlsx: FileExcelOutlined,
            doc: FileWordOutlined,
            docx: FileWordOutlined,
            md: FileMarkdownOutlined,
            zip: FileZipOutlined,
            rar: FileZipOutlined,
            ppt: FilePptOutlined,
            pptx: FilePptOutlined,
            jpg: FileJpgOutlined,
            jpeg: FileJpgOutlined,
        }[ext] || FileUnknownOutlined
    );
}

export function getFileName(file) {
    const ext = (file ?? "").split(".").pop();
    return (
        {
            pdf: "PDF",
            txt: "TXT",
            xls: "Excel",
            xlsx: "Excel",
            doc: "Word",
            docx: "Word",
            md: "MD",
            zip: "ZIP",
            rar: "RAR",
            ppt: "PPT",
            pptx: "PPT",
            jpg: "JPG",
            jpeg: "JPEG",
        }[ext] || ext
    );
}

const colorMap = {
    pdf: color("red"),
    txt: color("gray"),
    xls: color("green"),
    xlsx: color("green"),
    doc: color("blue"),
    docx: color("blue"),
    md: color("gray"),
    zip: color("gray"),
    rar: color("gray"),
    ppt: color("red"),
    pptx: color("red"),
    jpg: color("red"),
    jpeg: color("red"),
};

export function getFileColor(file) {
    const ext = (file ?? "").split(".").pop();
    return colorMap[ext] ?? color("gray");
}

export function toImplement(...params) {
    console.log(...params);
    message.info("not implemented");
}

export function jsondata(data, customHeaders = {}) {
    return {
        method: data == null ? "GET" : "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...customHeaders,
        },
        body: data && JSON.stringify(data),
    };
}

export function formdata(data) {
    return {
        method: data == null ? "GET" : "POST",
        body: data,
    };
}

export function isProduction() {
    return process.env.NODE_ENV === "production";
}

export const getServerUrl = () => {
    if (isProduction()) {
        return "https://api.globus.furniture";
    } else {
        const {protocol, hostname} = window.location;
        return `${protocol}//${hostname}:5000`;
    }
};

export function isMobile() {
    return window.innerWidth <= 500;
}

export async function request(link, data, format = jsondata) {
    const url =
        !isProduction() && link.includes("//") ? link.replace("https://api.globus.furniture", getServerUrl()) : link;

    const response = await fetch(url, format(data));
    if (response.status === 200) {
        return response.json();
    }
    return {};
}

export function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function genID(length = 4) {
    // eslint-disable-next-line immutable/no-let
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    // eslint-disable-next-line immutable/no-let
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export function makeArray(a, tail = []) {
    return a
        .filter(a => a.show == null || a.show === true)
        .map(a => <Fragment key={a.key}>{typeof a.value === "function" ? a.value() : a.value}</Fragment>)
        .concat(tail);
}

export function validate(regex, allowEmpty = false) {
    return (str = "") => {
        if (allowEmpty && str === "") {
            return {};
        }
        return str.match(regex);
    };
}

export function showDataRange(from, to, monthFormatting = "MMMM") {
    if (from.isSame(to, "day")) {
        return from.format(`${monthFormatting} D`);
    }
    const sameMonth = from.isSame(to, "month");
    return `${from.isValid() ? from.format(`${monthFormatting} D`) : "…"} – ${
        to.isValid() ? to.format(sameMonth ? "D" : `${monthFormatting} D`) : "…"
    }`;
}

const lng = localStorage.getItem("system-language");

const currencyMap = {
    "¥": "CNY",
    "₽": "RUB",
    $: "USD",
    "€": "EUR",
};

//export const dollars = (value, sign = "¥") => `${sign} ${value}`.replace(isChinese ? format4 :     format3, ",");
export const dollars = (value, sign = "¥") =>
    new Intl.NumberFormat(lng, {
        style: "currency",
        currency: lng !== "zh" && sign === "¥" ? "JPY" : currencyMap[sign],
        currencyDisplay: lng === "zh" ? "name" : "symbol",
        notation: lng === "zh" ? "compact" : "standard",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);

export const download = (link, name) => {
    // eslint-disable-next-line immutable/no-let
    let a = document.createElement("a");
    if (typeof name === "string") {
        a.download = name;
    } else {
        a.download = link.substring(link.lastIndexOf("/") + 1);
    }
    a.href = link;
    a.target = "_blank";
    a.click();
    a.remove();
};

export const random = (start, end) => {
    return Math.floor(Math.random() * end) + start;
};

export const groupBy = (items, key, preserveUndefined = false) => {
    if (!Array.isArray(items)) {
        return false;
    }
    const grouped = items.reduce(
        (result, item) => ({
            ...result,
            [item[key]]: [...(result[item[key]] || []), item],
        }),
        {},
    );
    if (!preserveUndefined) {
        delete grouped.undefined;
    }
    return grouped;
};

export const smooth = (n, signs = 0) => Math.round(n * 10 ** signs) / 10 ** signs;

export const salesManager = user =>
    typeof user.title === "string" && ["project manager", "sales manager"].includes(user.title);
export const admin = g => g != null && g > 8;

function hexToRgb(hex) {
    // eslint-disable-next-line immutable/no-let
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split("");
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = "0x" + c.join("");
        return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
    }
}

export const ellipsis = (str, limit) => {
    if (str.length > limit) {
        return <Tooltip title={str}>{str.substring(0, limit)}…</Tooltip>;
    }
    return str;
};

export function color(type, level, opacity = 1) {
    const names = Object.keys(presetPalettes);
    const index = typeof type === "number" ? names[type % names.length] : type;
    const c = presetPalettes[index] ?? presetPalettes.grey;
    if (opacity < 1) {
        const [r, g, b] = hexToRgb(c[level ?? 5]);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return c[level ?? 5];
}

export const randomColor = () => {
    const colors = [
        "red",
        "volcano",
        "gold",
        "orange",
        "yellow",
        "lime",
        "green",
        "cyan",
        "blue",
        "geekblue",
        "purple",
        "magenta",
    ];

    const randomColor = random(0, colors.length);
    const randomLevel = random(0, 10);
    return color(randomColor, randomLevel);
};

export function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// export const generateId = (() => {
//     let counter = 0;
//     return () => counter++;
// })();

export const benchmark = () => {
    const first = +new Date();
    return name => {
        const second = +new Date();
        const lag = second - first;
        if (name != null) {
            console.log(name, `${lag}ms`);
        }
        return lag;
    };
};

export function getReadableFileSizeString(fileSizeInBytes) {
    // eslint-disable-next-line immutable/no-let
    let i = -1;
    const byteUnits = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);
    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}

export const isConfirmed = status => {
    return [142, 22115713, 20674288].includes(status);
};

const LinkContainer = styled.span`
    cursor: pointer;
`;
export const Link = params => {
    return <LinkContainer {...params} />;
};

export const compareArrays = (a, b) => {
    if (a.length !== b.length) {
        return false;
    }
    const sortedA = a.slice().sort();
    const sortedB = b.slice().sort();
    return sortedA.every((v, i) => v === sortedB[i]);
};

export const leadName = lead => {
    const contactName = lead?.contacts?.[0]?.contact_name;

    const contact =
        contactName == null || contactName === ""
            ? "Incognito"
            : contactName
                  .split(" ")
                  .map(p => capitalize(p.toLowerCase()))
                  .join(" ");
    return [contact, lead.country, lead.city].filter(el => el != null).join(" ");
};

export const contactName = contact => contact?.contact_name ?? contact?.phone ?? contact?.whatsapp ?? contact?._id;

export const clientColor = lead => {
    if (lead.online) {
        return color("green");
    }
    return color("blue");
};

const first = 16 ** 5;

export const numberToItemId = number => {
    return (number + first).toString(16).toUpperCase();
};

export const itemIdToNumber = id => {
    return parseInt(id, 16) - first;
};

export const getImageLinkById = (id, style = "webp", session = null) => {
    const STYLE_SEPARATOR = "|";
    const url = `${getServerUrl()}/images/${id}${STYLE_SEPARATOR}${style}`;
    if (session === null) {
        return url;
    } else {
        return `${url}?session=${session}`;
    }
};

export const getImageLink = (photo, style = "webp", session = null) => {
    if (!photo) return photo;

    if (photo.startsWith("http") || photo.startsWith("data")) {
        return photo;
    } else {
        return getImageLinkById(photo, style, session);
    }
};

export const getFileLinkById = (id, session = null) => {
    const url = `${getServerUrl()}/files/${id}`;
    if (session === null) {
        return url;
    } else {
        return `${url}?session=${session}`;
    }
};

export const getFileLink = (file, session = null) => {
    if (!file) return file;

    return file.startsWith("http") ? file : getFileLinkById(file, session);
};

export const getContrastColor = color => {
    const rgb = color.replace("#", "");
    const r = parseInt(rgb.substr(0, 2), 16);
    const g = parseInt(rgb.substr(2, 2), 16);
    const b = parseInt(rgb.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "black" : "white";
};

export const usd = rates => 1 / rates?.USD?.value;


export const getBase64ForFile = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = e => {
            const base64 = e.target.result;
            resolve(base64);
        };
        reader.readAsDataURL(file);
    });
}

export const mostWantedItemOfArrayBy = curry((fn, list) => {
    return list.reduce((max, item) => fn(max, item));
})

export const maxItemOfArray = (list) => {
    return mostWantedItemOfArrayBy((a, b) => {
        return a > b ? a : b;
    }, list)
};

export const minItemOfArray = (list) => {
    return mostWantedItemOfArrayBy((a, b) => {
        return a < b ? a : b;
    }, list)
};
