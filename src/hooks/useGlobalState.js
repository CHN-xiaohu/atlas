import {createGlobalState} from "react-hooks-global-state";

const defaultInvalidateSettings = {
    leads: false,
    comments: true,
    dictionaries: true,
    files: false,
    images: false,
    invoices: false,
    links: false,
    logs: false,
    emails: true,
    newQuotations: false,
    newQuotationItems: false,
    notes: false,
    passwords: false,
    periods: false,
    pipelines: false,
    products: false,
    purchases: false,
    receipts: false,
    suppliers: false,
    tasks: false,
    templates: false,
    users: true,
    waChats: true,
    waMessages: true,
};

const userString = localStorage.getItem("user");
const defaultUser = userString == null ? {} : JSON.parse(userString);

const defaultFilters = {
    sort: {
        created_at: -1,
    },
    skip: 0,
    limit: 48,
};

const leadsPanelSettings = {
    search: "",
    hideEmptyColumns: true,
    hideSuspended: true,
    hideClientsOfDifferentManagers: true,
};

export const defaultState = {
    user: defaultUser,
    invalidateSettings: defaultInvalidateSettings,
    updateAvailable: false,
    "socket-storage": {},
    "products-filters": defaultFilters,
    activeUsers: [],
    "chat-module-settings": {},
    leadsSettings: leadsPanelSettings,
    replyTo: null,
    replyEmail: {},
    "whatsApp-inputState": {},
    "chatWindow-inputState": {},
    readStatus: null,
    approveStatus: null,
};

export const {useGlobalState, setGlobalState, getGlobalState} = createGlobalState(defaultState);
