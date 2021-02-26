import {manager, standard, admin} from "../Helper";
import moment from "moment";

export const templates = [
    {
        type: /^before$/,
        name: "Before arrival",
        fields: [
            {
                type: "checkbox",
                name: "Вышел на связь с клиентом",
                notice: "Менеджер вышел на связь с клиентом",
                key: "contacted_clients",
                defaultValue: false,
                access: manager,
            },
            {
                type: "checkbox",
                name: "Подбираю товары клиенту",
                notice: "Менеджер подбирает товары клиенту",
                key: "finding_positions_for_client",
                defaultValue: false,
                access: manager,
            },
            {
                type: "checkbox",
                name: "Не могу найти товары клиенту",
                notice: "Менеджер не может найти товары клиенту",
                key: "cant_find",
                defaultValue: false,
                access: manager,
            },
            {
                type: "radio",
                key: "client_happiness",
                notice: "Обновлен статус довольности клиента",
                options: {
                    client_happy: "Клиент доволен",
                    client_unhappy: "Клиент недоволен",
                },
                access: manager,
            },
            {
                type: "checkbox",
                name: "Сомневается стоит ли приезжать",
                notice: "Клиент сомневается стоит ли приезжать",
                key: "unsure__wheather_needs_to_come",
                defaultValue: false,
                access: manager,
            },
            {
                type: "checkbox",
                name: "Перестал отвечать",
                notice: "Клиент перестал отвечать",
                key: "client_disappeared",
                defaultValue: false,
                access: manager,
            },
        ],
    },
    {
        type: /^1$/,
        name: "First day",
        fields: [
            {
                type: "checkbox",
                name: "Встретил клиента, едем в такси",
                notice: "Менеджер встретил клиента",
                key: "met_clients",
                defaultValue: false,
                access: manager,
            },
            {
                type: "checkbox",
                name: "Клиент внес депозит",
                notice: "Клиент внес депозит",
                key: "gave_us_deposit",
                defaultValue: false,
                access: standard,
            },
            {
                type: "checkbox",
                name: "Клиент покупает",
                notice: "Клиент покупает",
                key: "started_to_buy",
                defaultValue: false,
                children: [
                    {
                        type: "radio",
                        key: "client_deposit_status",
                        notice: "Обновлен статус внесения депозитов по покупкам",
                        options: {
                            deposit_now: "Вносит депозиты",
                            deposits_later: "Хочет внести депозиты позже",
                        },
                        access: manager,
                    },
                ],
                access: manager,
            },
            {
                type: "checkbox",
                name: "Есть проблемы",
                key: "manager_has_problems",
                notice: "У менеджера проблемы с клиентами",
                defaultValue: false,
                access: manager,
                children: [
                    {
                        type: "checkbox",
                        name: "Не можем найти часть товаров",
                        notice: "Менеджер не может найти часть товаров",
                        key: "cantfind",
                        defaultValue: false,
                        access: manager,
                    },
                    {
                        type: "checkbox",
                        name: "Клиент недоволен выбором",
                        notice: "Клиент недоволен выбором",
                        key: "unhappy_with_choice",
                        defaultValue: false,
                        access: manager,
                    },
                    {
                        type: "checkbox",
                        name: "Клиент недоволен ценами",
                        notice: "Клиент недоволен ценами",
                        key: "prices_problem",
                        defaultValue: false,
                        access: manager,
                    },
                ],
            },
            {
                type: "text",
                name: "Другая информация",
                notice: "Менеджер обновил комментарий",
                key: "comment",
                defaultValue: "",
                access: manager,
            },
            {
                type: "money",
                name: "Затраты на такси",
                key: "taxi_cost",
                defaultValue: 0,
                access: manager,
            },
            {
                type: "photos",
                name: "Скриншоты такси",
                key: "taxi_proof",
                defaultValue: [],
                access: manager,
            },
        ],
    },
    {
        type: /(?!^1$)(^\d+$)/,
        name: "2+ day",
        fields: [
            {
                type: "checkbox",
                name: "Клиент покупает",
                notice: "Клиент покупает",
                key: "started_to_buy",
                defaultValue: false,
                children: [
                    {
                        type: "radio",
                        key: "client_deposit_status",
                        notice: "Обновлен статус внесения депозитов по покупкам",
                        options: {
                            deposit_now: "Вносит депозиты",
                            deposits_later: "Хочет внести депозиты позже",
                        },
                        access: manager,
                    },
                ],
                access: manager,
            },
            {
                type: "checkbox",
                name: "Есть проблемы",
                key: "manager_has_problems",
                notice: "У менеджера проблемы с клиентами",
                defaultValue: false,
                access: manager,
                children: [
                    {
                        type: "checkbox",
                        name: "Не можем найти часть товаров",
                        notice: "Менеджер не может найти часть товаров",
                        key: "cantfind",
                        defaultValue: false,
                        access: manager,
                    },
                    {
                        type: "checkbox",
                        name: "Клиент недоволен выбором",
                        notice: "Клиент недоволен выбором",
                        key: "unhappy_with_choice",
                        defaultValue: false,
                        access: manager,
                    },
                    {
                        type: "checkbox",
                        name: "Клиент недоволен ценами",
                        notice: "Клиент недоволен ценами",
                        key: "prices_problem",
                        defaultValue: false,
                        access: manager,
                    },
                ],
            },
            {
                type: "text",
                name: "Другая информация",
                notice: "Менеджер обновил комментарий",
                key: "comment",
                defaultValue: "",
                access: manager,
            },
            {
                type: "money",
                name: "Затраты на такси",
                key: "taxi_cost",
                defaultValue: 0,
                access: manager,
            },
            {
                type: "photos",
                name: "Скриншоты такси",
                key: "taxi_proof",
                defaultValue: [],
                access: manager,
            },
        ],
    },
    {
        type: /^after$/,
        name: "After departure",
        fields: [
            {
                type: "checkbox",
                name: "Депозит поступил на счет",
                notice: "Депозит от клиента поступил на счет",
                key: "deposit_received",
                defaultValue: false,
                access: admin,
            },
            {
                type: "checkbox",
                name: "Баланс поступил на счёт",
                key: "balance_received",
                notice: "Баланс от клиента поступил на счёт",
                defaultValue: false,
                access: admin,
            },
            {
                type: "money",
                name: "Затраты на такси",
                key: "taxi_cost",
                defaultValue: 0,
                access: manager,
            },
            {
                type: "text",
                name: "Другая информация",
                notice: "Менеджер обновил комментарий",
                key: "comment",
                defaultValue: "",
                access: manager,
            },
        ],
    },
    {
        type: /^loading$/,
        name: "Отгрузки и доставка",
        fields: [
            {
                type: "date",
                name: "Дата отгрузки",
                notice: "Депозит от клиента поступил на счет",
                key: "loading_date",
                defaultValue: moment().unix(),
                access: standard,
            },
            {
                type: "checkbox",
                name: "Погрузка успешно закончена",
                key: "loading_success",
                notice: "Погрузка успешно закончена",
                defaultValue: false,
                access: manager,
            },
            {
                type: "text",
                name: "Номер пломбы",
                key: "plumb_number",
                defaultValue: "",
                access: standard,
            },
            {
                type: "checkbox",
                name: "Контейнер в пути по Китаю",
                key: "container_in_china",
                notice: "Погрузка успешно закончена",
                defaultValue: false,
                access: admin,
            },
            {
                type: "checkbox",
                name: "Контейнер прибыл на таможню",
                key: "container_customs",
                notice: "Контейнер прибыл на таможню",
                defaultValue: false,
                access: admin,
            },
            {
                type: "checkbox",
                name: "Контейнер прошел таможню",
                key: "container_passed_customs",
                notice: "Контейнер прошел таможенное оформление",
                defaultValue: false,
                access: admin,
            },
            {
                type: "checkbox",
                name: "Клиенту выставлен финальный счет",
                key: "final_bill",
                notice: "Клиенту выставлен финальный счет, ждем оплату",
                defaultValue: false,
                access: standard,
            },
            {
                type: "checkbox",
                name: "Клиент оплатил счет",
                key: "paid_final_bill",
                notice: "Клиент оплатил финальный счет",
                defaultValue: false,
                access: admin,
            },
            {
                type: "checkbox",
                name: "Контейнер в пути до города клиента",
                key: "container_on_its_way",
                notice: "Контейнер в пути до города клиента",
                defaultValue: false,
                access: admin,
            },
            {
                type: "checkbox",
                name: "Клиент получил контейнер",
                key: "received_the_container",
                notice: "Клиент получил контейнер",
                defaultValue: false,
                access: admin,
            },
            {
                type: "text",
                name: "Другая информация",
                notice: "Комментарий обновлен",
                key: "comment",
                defaultValue: "",
                access: standard,
            },
        ],
    },
    {
        name: "No template",
        type: /.*/,
        fields: [
            {
                name: "Нет шаблона",
                key: "no_template",
                access: standard,
            },
        ],
    },
];