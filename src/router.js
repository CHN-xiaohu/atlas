import {
    CarryOutOutlined,
    ContactsOutlined,
    ExperimentOutlined,
    GoldOutlined,
    MailOutlined,
    LinkOutlined,
    ScheduleOutlined,
    StockOutlined,
    TeamOutlined,
    WhatsAppOutlined,
    TranslationOutlined,
    FileDoneOutlined
} from "@ant-design/icons";
import {MailBox} from "./pages/Mailbox";
import {Schedule} from "./pages/Schedule";
import {Statistics} from "./pages/Statistics";
import {Leads} from "./pages/Leads";
import {Tasks} from "./pages/Tasks";
import {Chat} from "./pages/Chat";
import {Products} from "./pages/Products";
import {TemplateEditor} from "./pages/TemplateEditor";
import {Links} from "./pages/Links";
import {Users} from "./pages/Users";
import {Dictionary} from "./pages/Dictionary";
import {Quotations} from "./pages/Quotations";

export const router = [
    {
        name: "markup.Mails",
        path: "mails",
        component: MailBox,
        icon: MailOutlined,
        accessLevel: (g, user) => user?.access?.mails?.canSeeModule,
    },
    {
        name: "markup.Schedule",
        path: "schedule",
        component: Schedule,
        icon: ScheduleOutlined,
        accessLevel: (g, user) => user?.access?.schedule?.canSeeModule,
    },
    {
        name: "markup.Statistics",
        path: "stats",
        component: Statistics,
        icon: StockOutlined,
        depends: [],
        accessLevel: (g, user) => user?.access?.statistics?.canSeeModule,
    },
    {
        name: "markup.Leads",
        path: "leads",
        component: Leads,
        icon: ContactsOutlined,
        accessLevel: (g, user) => user?.access?.leads?.canSeeModule,
    },
    {
        name: "markup.Tasks",
        path: "tasks",
        component: Tasks,
        icon: CarryOutOutlined,
        accessLevel: (g, user) => user?.access?.tasks?.canSeeModule,
    },
    {
        name: "markup.Whatsapp",
        path: "whatsapp",
        component: Chat,
        icon: WhatsAppOutlined,
        accessLevel: (g, user) => user?.access?.whatsapp?.canSeeModule,
    },
    {
        name: "markup.Products",
        path: "products",
        component: Products,
        icon: GoldOutlined,
        accessLevel: (g, user) => user?.access?.products?.canSeeModule,
    },
    {
        name: "quotation.moduleName",
        path: "quotations",
        component: Quotations,
        icon: FileDoneOutlined,
        accessLevel: (g, user) => user?.access?.products?.canSeeQuotations,
    },
    {
        name: "markup.TemplateEditor",
        path: "editor",
        component: TemplateEditor,
        icon: ExperimentOutlined,
        accessLevel: (g, user) => user?.access?.templates?.canSeeModule,
    },
    {
        name: "markup.Links",
        path: "links",
        component: Links,
        icon: LinkOutlined,
        accessLevel: (g, user) => user?.access?.links?.canSeeModule,
    },
    {
        name: "markup.Users",
        path: "users",
        component: Users,
        icon: TeamOutlined,
        accessLevel: (g, user) => user?.access?.users?.canSeeModule,
    },
    {
        name: "markup.Dictionary",
        path: "dictionary",
        component: Dictionary,
        icon: TranslationOutlined,
        accessLevel: (g, user) => user?.access?.dictionary?.canSeeModule,
    },
];
