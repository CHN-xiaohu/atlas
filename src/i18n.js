import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import en from "./translation/en.json";
import ru from "./translation/ru.json";
import zh from "./translation/zh.json";

i18n.use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources: {
            en,
            ru,
            zh,
        },
        lng: localStorage.getItem("system-language") ?? 'en',
        fallbackLng: "en",
    });
