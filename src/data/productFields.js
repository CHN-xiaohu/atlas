import { dollars } from "Helper";
import i18next from "i18next";

const select = (key, label, options = [], multiple = false) => ({
    label,
    key,
    options: options.sort().map(option => ({
        label: option,
        value: option.toString(),
    })),
    type: "select",
    params: {
        mode: multiple && "multiple",
    },
    renderPreview: value => (multiple ? value?.join(", ") : value),
});

const tags = (key, label, options = []) => ({
    label,
    key,
    options,
    type: "choice",
    params: {
        showName: true,
        multipleChoice: true,
    },
});

const sorter = (a, b) => a.label.localeCompare(b.label);

export const firstSuitable = (options = [], checker = o => typeof o === "string" && o.length > 0) =>
    options.find(checker);

// const businesses = ["ресторан", "отель", "офис", "бар", "салон красоты", "магазин"];

const sex = ["Для мальчиков", "Для девочек", "Для подростков"];

const sexField = tags("sex", "Sex", sex);

const storageType = tags(
    "tags",
    "Tags",
    ["раскладывающиеся", "с местом для хранения"].map(s => ({
        label: s,
        key: s,
        value: s,
    })),
);

export const categories = [
    {
        label: "categories.armchairsAndSofas.label",
        key: "kresla-i-divani",
        defaultInterest: 0.3,
        children: [
            {
                label: "categories.armchairsAndSofas.straightSofas",
                key: "pryamie-divani",
                default: {
                    name: "Диван",
                    englishName: "Sofa",
                },
                fields: [select("sittingPlaces", "Sitting places", [1, 2, 3, 4, 5, "5+"], true), storageType],
            },
            {
                label: "categories.armchairsAndSofas.cornerSofas",
                key: "uglivie-divani",
                default: {
                    name: "Угловой диван",
                    englishName: "Corner sofa",
                },
                fields: [select("sittingPlaces", "Sitting places", [1, 2, 3, 4, 5, "5+"], true), storageType],
            },
            {
                label: "categories.armchairsAndSofas.sofaSet",
                key: "divani-gruppi",
                default: {
                    name: "Диванная группа",
                    englishName: "Sofa set",
                },
                fields: [select("sittingPlaces", "Sitting places in total", [1, 2, 3, 4, 5, "5+"], true), storageType],
            },
            {
                label: "categories.armchairsAndSofas.roundSofa",
                key: "polukruglie-divani",
                default: {
                    name: "Полукруглый диван",
                    englishName: "Round sofa",
                },
                fields: [select("sittingPlaces", "Sitting places", [1, 2, 3, 4, 5, "5+"], true), storageType],
            },
            {
                label: "categories.armchairsAndSofas.cinemaSofa",
                key: "divani-dlya-kinozala",
                default: {
                    name: "Диван для кинозала",
                    englishName: "Cinema sofa",
                },
                fields: [select("sittingPlaces", "Sitting places", [1, 2, 3, 4, 5, "5+"], true), storageType],
            },
            {
                label: "categories.armchairsAndSofas.recliningSofa",
                key: "divani-s-reklainerom",
                default: {
                    name: "Диван с реклайнером",
                    englishName: "Reclining sofa",
                },
                fields: [select("sittingPlaces", "Sitting places", [1, 2, 3, 4, 5, "5+"], true), storageType],
            },
            {
                label: "categories.armchairsAndSofas.outdoorSofa",
                key: "divani-dlya-terrasi",
                default: {
                    name: "Диван для террасы",
                    englishName: "Outdoor sofa",
                },
                fields: [select("sittingPlaces", "Sitting places", [1, 2, 3, 4, 5, "5+"], true), storageType],
            },
            {
                label: "categories.armchairsAndSofas.outdoorBed",
                key: "divani-krovati",
                default: {
                    name: "Диван-кровать",
                    englishName: "Outdoor bed",
                },
                fields: [storageType],
            },
            {
                label: "categories.armchairsAndSofas.modularSectionalSofas",
                key: "modulnie-divani",
                default: {
                    name: "Диван",
                    englishName: "Sofa",
                },
                fields: [select("sittingPlaces", "Sitting places", [1, 2, 3, 4, 5, "5+"], true), storageType],
            },
            {
                label: "categories.armchairsAndSofas.couch",
                key: "kushetki",
                default: {
                    name: "Кушетка",
                    englishName: "Couch",
                },
            },
            {
                label: "categories.armchairsAndSofas.banquetsAndPoufs",
                key: "pufi-i-banketki",
                fields: [tags("tags", "Tags", ["с местом для хранения", "круглые"])],
                default: {
                    name: "Банкетка",
                    englishName: "Ottoman",
                },
            },
            {
                label: "categories.armchairsAndSofas.livingRoomArmchairs",
                key: "kresla-dlya-gostinoi",
                default: {
                    name: "Кресло",
                    englishName: "Armchair",
                },
                fields: [storageType],
            },
            {
                label: "categories.armchairsAndSofas.officeChairsAndArmchairs",
                key: "ofisnie-stulya-i-kresla",
                default: {
                    name: "Офисное кресло",
                    englishName: "Office chair",
                },
            },
            {
                label: "categories.armchairsAndSofas.babySeats",
                key: "detskie-kresla",
                default: {
                    name: "Детское кресло",
                    englishName: "Chair for children",
                },
                fields: [sexField],
            },
            {
                label: "categories.armchairsAndSofas.armchairsBags",
                key: "kresla-meshki",
                default: {
                    name: "Кресло-мешок",
                    englishName: "Bean Bag Chair",
                },
            },
            {
                label: "categories.armchairsAndSofas.rockingChairs",
                key: "kresla-kachalki",
                default: {
                    name: "Кресло-качалка",
                    englishName: "Rocking-chair",
                },
            },
            {
                label: "categories.armchairsAndSofas.massageChairs",
                key: "massagnie-kresla",
                default: {
                    name: "Кресло-качалка",
                    englishName: "Rocking-chair",
                },
            },
            {
                label: "categories.armchairsAndSofas.cinemaChairsReclinerChairs",
                key: "kresla-s-reklainerom",
                default: {
                    name: "Кресло для кинозала",
                    englishName: "Cinema armchair",
                },
            },
            {
                label: "categories.armchairsAndSofas.terraceChairs",
                key: "kresla-dlya-terrasi",
                default: {
                    name: "Кресло для террасы",
                    englishName: "Outdoor armchair",
                },
            },
            {
                label: "categories.armchairsAndSofas.terraceSofaGroups",
                key: "divgrupi-dlya-terrasi",
                default: {
                    name: "Диванная группа для террасы",
                    englishName: "Outdoor sofa set",
                },
            },
            {
                label: "categories.armchairsAndSofas.hangingChairs",
                key: "podvesnie-kresla",
                default: {
                    name: "Подвесное кресло",
                    englishName: "Hanging chair",
                },
            },
            {
                label: "categories.armchairsAndSofas.sunLoungers",
                key: "shezlongi",
                default: {
                    name: "Шезлонг",
                    englishName: "Sun Lounger",
                },
            },
        ],
    },
    {
        label: "categories.bedsAndMattresses.label",
        key: "krovati-i-matrasi",
        defaultInterest: 0.3,
        children: [
            {
                label: "categories.bedsAndMattresses.sleepingSets",
                key: "spalniegarnituri",
                default: {
                    name: "Спальный гарнитур",
                    englishName: "Bedroom set",
                },
            },
            {
                label: "categories.bedsAndMattresses.bed",
                key: "krovati",
                default: {
                    name: "Кровать",
                    englishName: "Bed",
                },
                fields: [
                    tags("type", "Type", ["односпальные", "двуспальные"]),
                    tags("tags", "Tags", ["без изголовья", "с подъемным механизмом", "местом для хранения"]),
                ],
            },
            {
                label: "categories.bedsAndMattresses.roundBed",
                key: "krugliekrovati",
                default: {
                    name: "Круглая кровать",
                    englishName: "Round bed",
                },
            },
            {
                label: "categories.bedsAndMattresses.multifunctionalBed",
                key: "krovatmfu",
                default: {
                    name: "Многофункциональная кровать",
                    englishName: "Multifunctional bed",
                },
            },
            {
                label: "categories.bedsAndMattresses.bedForKids",
                key: "detskieodnoyarus",
                fields: [sexField],
                default: {
                    name: "Детская кровать",
                    englishName: "Bed for kids",
                },
            },
            {
                label: "categories.bedsAndMattresses.bunkBedForKids",
                key: "detskiyedvuyarusnie",
                fields: [sexField],
                default: {
                    name: "Детская двухярусная кровать",
                    englishName: "Bunk bed for kids",
                },
            },
            {
                label: "categories.bedsAndMattresses.bunkBed",
                key: "krovaticherdaki",
                fields: [sexField],
                default: {
                    name: "Детская кровать-чердак",
                    englishName: "Bunk bed",
                },
            },
            {
                label: "categories.bedsAndMattresses.bunkBedWithDesk",
                key: "cherdaknazone",
                fields: [sexField],
                default: {
                    name: "Детская кровать-чердак",
                    englishName: "Bunk bed with desk",
                },
            },
            {
                label: "categories.bedsAndMattresses.cotsForNewborns",
                key: "krovatdlyaxiaobaobei",
                fields: [sexField],
                default: {
                    name: "Кровать для новорожденных",
                    englishName: "Crib",
                },
            },
            {
                label: "categories.bedsAndMattresses.hammock",
                key: "gamaki",
                default: {
                    name: "Гамак",
                    englishName: "Hammock",
                },
            },
            {
                label: "categories.bedsAndMattresses.mattress",
                key: "matrasi",
                fields: [
                    select("type", "Type", ["двусторонние", "односторонние"]),
                    tags("tags", "Tags", ["регулируемые", "стандартные", "массажные"]),
                ],
                default: {
                    name: "Матрас",
                    englishName: "Mattress",
                },
            },
        ],
    },
    {
        label: "categories.cabinetsRacksShelves.label",
        key: "skafi-stellaji-polki",
        defaultInterest: 0.3,
        children: [
            {
                label: "categories.cabinetsRacksShelves.wardrobe",
                key: "shkafi-dlya-odejdi",
                fields: [tags("tags", "Tags", ["встроенные"])],
                default: {
                    name: "Шкаф для одежды",
                    englishName: "Wardrobe",
                },
            },
            {
                label: "categories.cabinetsRacksShelves.wardrobeForKids",
                key: "detskie-shkafi",
                default: {
                    name: "Детский шкаф",
                    englishName: "Wardrobe for kids",
                },
                fields: [sexField, tags("tags", "Tags", ["встроенные"])],
            },
            {
                label: "categories.cabinetsRacksShelves.dresser",
                key: "komodi",
                default: {
                    name: "Комод",
                    englishName: "Dresser",
                },
                fields: [tags("tags", "Tags", ["тумба для документов"])],
            },
            {
                label: "categories.cabinetsRacksShelves.console",
                key: "konsoli",
                default: {
                    name: "Консоль",
                    englishName: "Console",
                },
            },
            {
                label: "categories.cabinetsRacksShelves.bookshelf",
                key: "knizhnie-shkafi",
                fields: [tags("tags", "Tags", ["встроенные"])],
                default: {
                    name: "Книжный шкаф",
                    englishName: "Bookshelf",
                },
            },
            {
                label: "categories.cabinetsRacksShelves.rack",
                key: "stellaji",
                default: {
                    name: "Стеллаж",
                    englishName: "Rack",
                },
                fields: [tags("tags", "Tags", ["встроенные"])],
            },
            {
                label: "categories.cabinetsRacksShelves.shelf",
                key: "polki",
                fields: [select("type", "Type", ["прямые", "угловые", "многоуровневые", "нестандартные"])],
                default: {
                    name: "Полка",
                    englishName: "Shelf",
                },
            },
            {
                label: "categories.cabinetsRacksShelves.TVStand",
                key: "tv-tumbi",
                default: {
                    name: "ТВ тумба",
                    englishName: "TV stand",
                },
            },
            {
                label: "categories.cabinetsRacksShelves.TVHeadsetsWalls",
                key: "tv-garnituri-stenki",
                default: {
                    name: "ТВ гарнитур",
                    englishName: "TV set",
                },
            },
            {
                label: "categories.cabinetsRacksShelves.bedsideTable",
                key: "prikrovatnie-tumbi",
                default: {
                    name: "Прикроватная тумба",
                    englishName: "Bedside table",
                },
            },
            {
                label: "categories.cabinetsRacksShelves.bedsideTableForKids",
                key: "detskie-prikrovatnie-tumbi",
                default: {
                    name: "Прикроватная тумба для детей",
                    englishName: "Bedside table for kids",
                },
            },
            {
                label: "categories.cabinetsRacksShelves.bathroomCabinet",
                key: "mebel-dlya-vannih-komnat",
                default: {
                    name: "Ванный шкаф",
                    englishName: "Bathroom cabinet",
                },
            },
            {
                label: "categories.cabinetsRacksShelves.wineCabinet",
                key: "vinnie-shkafi",
                default: {
                    name: "Винный шкаф",
                    englishName: "Wine cabinet",
                },
                fields: [tags("tags", "Tags", ["встроенные"])],
            },
            {
                label: "categories.cabinetsRacksShelves.cupboard",
                key: "bufeti-i-servanti",
                default: {
                    name: "Буфет",
                    englishName: "Cupboard",
                },
            },
            {
                label: "categories.cabinetsRacksShelves.jewelryCabinet",
                key: "shafi-dlya-ukrashenii",
                default: {
                    name: "Шкаф для украшений",
                    englishName: "Jewelry cabinet",
                },
            },

            {
                label: "categories.cabinetsRacksShelves.shoeCabinet",
                key: "obuvnici",
                default: {
                    name: "Обувница",
                    englishName: "Shoe cabinet",
                },
            },
            {
                label: "categories.cabinetsRacksShelves.walkInWardrobes",
                key: "garderobnie",
                default: {
                    name: "Гардеробная",
                    englishName: "Walk-in wardrobes",
                },
            },
            {
                label: "categories.cabinetsRacksShelves.flowerStand",
                key: "tumbi-pod-cveti",
                default: {
                    name: "Тумба под цветы",
                    englishName: "Flower stand",
                },
            },
            {
                label: "categories.cabinetsRacksShelves.magazineRacks",
                key: "gazetnici",
                default: {
                    name: "Газетница",
                    englishName: "Magazine rack",
                },
            },
        ],
    },
    {
        label: "categories.tablesAndChairs.label",
        key: "stoli-stulya",
        defaultInterest: 0.3,
        children: [
            {
                label: "categories.tablesAndChairs.diningTable",
                key: "obedennie-stoli",
                fields: [tags("tags", "Tags", ["раскладные", "вращающиеся", "круглые"])],
                default: {
                    name: "Обеденный стол",
                    englishName: "Dining table",
                },
            },
            {
                label: "categories.tablesAndChairs.diningSet",
                key: "obedennie-gruppi",
                default: {
                    name: "Обеденная группа",
                    englishName: "Dining set",
                },
            },
            {
                label: "categories.tablesAndChairs.outdoorDiningSet",
                key: "dining-set-dlya-terrasi",
                default: {
                    name: "Обеденная группа для террасы",
                    englishName: "Outdoor dining set",
                },
            },
            {
                label: "categories.tablesAndChairs.coffeeTable",
                key: "jurnalnie-stoliki",
                fields: [tags("tags", "Tags", ["с местом для хранения", "монолитные", "круглые"])],
                default: {
                    name: "Журнальный столик",
                    englishName: "Coffee table",
                },
            },
            {
                label: "categories.tablesAndChairs.cornerTable",
                key: "uglovie-stoliki",
                fields: [tags("tags", "Tags", ["с местом для хранения", "монолитные", "круглые"])],
                default: {
                    name: "Угловой столик",
                    englishName: "Corner table",
                },
            },
            {
                label: "categories.tablesAndChairs.dressingTable",
                key: "tualenie-stoliki",
                default: {
                    name: "Туалетный столик",
                    englishName: "Dressing table",
                },
                fields: [tags("tags", "Tags", ["с зеркалом", "с открывающейся столешницей", "круглые"])],
            },
            {
                label: "categories.tablesAndChairs.officeStudyTables",
                key: "stoli-dlya-ofisa-kabineta",
                fields: [tags("tags", "Tags", ["с тумбой", "угловой", "круглые"])],
                default: {
                    name: "Письменный стол",
                    englishName: "Desk",
                },
            },
            {
                label: "categories.tablesAndChairs.cafeTables",
                key: "stoli-dlya-kafe",
                default: {
                    name: "Стол",
                    englishName: "Table",
                },
                fields: [tags("tags", "Tags", ["для улицы", "для помещения", "круглые"])],
            },
            {
                label: "categories.tablesAndChairs.writingAndComputerTables",
                key: "pismennie-stoli",
                fields: [
                    tags("tags", "Tags", [
                        "с тумбой",
                        "со шкафом",
                        "угловой",
                        "с подставкой под клавиатуру",
                        "круглые",
                    ]),
                ],
                default: {
                    name: "Письменный стол",
                    englishName: "Desk",
                },
            },
            {
                label: "categories.tablesAndChairs.servingTables",
                key: "serving-tables",
                default: {
                    name: "Сервировочный столик",
                    englishName: "Serving table",
                },
                fields: [tags("tags", "Tags", ["круглые"])],
            },
            {
                label: "categories.tablesAndChairs.tableForKids",
                key: "detskie-stoli",
                fields: [sexField, tags("tags", "Tags", ["круглые"])],
                default: {
                    name: "Детский стол",
                    englishName: "Table for kids",
                },
            },
            {
                label: "categories.tablesAndChairs.workspaceForKids",
                key: "detskoe-rabochee-mesto",
                fields: [sexField, tags("tags", "Tags", ["круглые"])],
                default: {
                    name: "Детское рабочее место",
                    englishName: "Workspace for kids",
                },
            },
            {
                label: "categories.tablesAndChairs.kidsDressingTables",
                key: "detskie-tualetnie-stoliki",
                fields: [sexField, tags("tags", "Tags", ["круглые"])],
                default: {
                    name: "Детский туалетный столик",
                    englishName: "Kids dressing table",
                },
            },
            {
                label: "categories.tablesAndChairs.teaTable",
                key: "chainie-stoli",
                default: {
                    name: "Чайный стол",
                    englishName: "Tea table",
                },
            },
            {
                label: "categories.tablesAndChairs.gameTable",
                key: "igrovie-stoli",
                default: {
                    name: "Игровой стол",
                    englishName: "Game table",
                },
            },
            {
                label: "categories.tablesAndChairs.outdoorTable",
                key: "stoli-dlya-terrasi",
                fields: [tags("tags", "Tags", ["круглые"])],
                default: {
                    name: "Столик для террасы",
                    englishName: "Outdoor table",
                },
            },
            {
                label: "categories.tablesAndChairs.kitchenChair",
                key: "kuhonnie-stulya",
                default: {
                    name: "Кухонный стул",
                    englishName: "Kitchen chair",
                },
            },
            {
                label: "categories.tablesAndChairs.stool",
                key: "tabureti",
                default: {
                    name: "Табурет",
                    englishName: "Stool",
                },
            },
            {
                label: "categories.tablesAndChairs.barCounter",
                key: "barnie-stoiki",
                fields: [tags("tags", "Tags", ["круглые"])],
                default: {
                    name: "Барная стойка",
                    englishName: "Bar counter",
                },
            },
            {
                label: "categories.tablesAndChairs.barTable",
                key: "barnie-stoli",
                default: {
                    name: "Барный стол",
                    englishName: "Bar table",
                },
            },
            {
                label: "categories.tablesAndChairs.barChairs",
                key: "barnie-stulya",
                fields: [
                    select("type", "Type", ["регулируемые", "нерегулируемые"]),
                    tags("tags", "Tags", ["крутящееся сиденье"]),
                ],
                default: {
                    name: "Барный стул",
                    englishName: "Barstool",
                },
            },
            {
                label: "categories.tablesAndChairs.officeChairsAndArmchairs",
                key: "ofisnie-stulya-i-kresla",
                default: {
                    name: "Офисный стул",
                    englishName: "Office chair",
                },
            },
            {
                label: "categories.tablesAndChairs.kidsChair",
                key: "detskie-stulya",
                fields: [sexField],
                default: {
                    name: "Детский стул",
                    englishName: "Kids chair",
                },
            },
            {
                label: "categories.tablesAndChairs.outdoorChair",
                key: "stulya-dlya-terrasi",
                default: {
                    name: "Стул для террасы",
                    englishName: "Outdoor chair",
                },
            },
            {
                label: "categories.tablesAndChairs.outdoorBarChairs",
                key: "barnie-stulya-outdoor",
                fields: [
                    select("type", "Type", ["регулируемые", "нерегулируемые"]),
                    tags("tags", "Tags", ["крутящееся сиденье"]),
                ],
                default: {
                    name: "Барный стул для террасы",
                    englishName: "Outdoor barstool",
                },
            },
        ],
    },
    {
        label: "categories.lighting.label",
        key: "osvesheniye",
        defaultInterest: 0.4,
        children: [
            {
                label: "categories.lighting.chandelier",
                key: "lustri",
                default: {
                    name: "Люстра",
                    englishName: "Chandelier",
                },
                fields: [tags("tags", "Tags", ["с регулировкой цвета", "с регулировкой яркости"])],
            },
            {
                label: "categories.lighting.ceilingLamp",
                key: "potolsvet",
                default: {
                    name: "Потолочный светильник",
                    englishName: "Ceiling lamp",
                },
                fields: [tags("tags", "Tags", ["с регулировкой цвета", "с регулировкой яркости"])],
            },
            {
                label: "categories.lighting.wallLamp",
                key: "bra-i-nastennie-svetilniki",
                default: {
                    name: "Бра",
                    englishName: "Wall lamp",
                },
                fields: [tags("tags", "Tags", ["с регулировкой цвета", "с регулировкой яркости"])],
            },
            {
                label: "categories.lighting.deskLamp",
                key: "nastolnie-lampi",
                default: {
                    name: "Настольная лампа",
                    englishName: "Desk lamp",
                },
                fields: [tags("tags", "Tags", ["с сенсором", "с регулировкой цвета", "с регулировкой яркости"])],
            },
            {
                label: "categories.lighting.floorLamp",
                key: "torsheri",
                default: {
                    name: "Торшер",
                    englishName: "Floor lamp",
                },
                fields: [tags("tags", "Tags", ["с регулировкой цвета", "с регулировкой яркости"])],
            },
            {
                label: "categories.lighting.plafond",
                key: "plafoni",
                default: {
                    name: "Плафон",
                    englishName: "Plafond",
                },
                fields: [tags("tags", "Tags", ["с регулировкой цвета", "с регулировкой яркости"])],
            },
            {
                label: "categories.lighting.coolingfan",
                key: "coolingfans",
                default: {
                    name: "Вентилятор",
                    englishName: "Fan",
                },
                //fields: [tags("tags", "Tags", ["с регулировкой цвета", "с регулировкой яркости"])],
            },
            {
                label: "categories.lighting.kidsChandelier",
                key: "detskie-lustri",
                default: {
                    name: "Детская люстра",
                    englishName: "Kids chandelier",
                },
                fields: [sexField, tags("tags", "Tags", ["с регулировкой цвета", "с регулировкой яркости"])],
            },
            {
                label: "categories.lighting.kidsLamp",
                key: "detskie-svetilniki",
                default: {
                    name: "Детские светильники",
                    englishName: "Kids lamp",
                },
                fields: [sexField, tags("tags", "Tags", ["с регулировкой цвета", "с регулировкой яркости"])],
            },
            {
                label: "categories.lighting.floorLampForKids",
                key: "detskie-torsheri",
                default: {
                    name: "Детский торшер",
                    englishName: "Floor lamp for kids",
                },
                fields: [sexField, tags("tags", "Tags", ["с регулировкой цвета", "с регулировкой яркости"])],
            },
            {
                label: "categories.lighting.deskLampForKids",
                key: "detskie-nastolnie-lampi",
                default: {
                    name: "Детская настольная лампа",
                    englishName: "Desk lamp for kids",
                },
                fields: [sexField, tags("tags", "Tags", ["с регулировкой цвета", "с регулировкой яркости"])],
            },
            {
                label: "categories.lighting.stripLight",
                key: "svetodiodnie-lenti",
                default: {
                    name: "Светодиодная лента",
                    englishName: "Strip light",
                },
                fields: [tags("tags", "Tags", ["с регулировкой цвета", "с регулировкой яркости"])],
            },
            {
                label: "categories.lighting.diodeLighting",
                key: "diodnoe-osveshenie",
                default: {
                    name: "Диодное освещение",
                    englishName: "Diode lighting",
                },
                fields: [tags("tags", "Tags", ["с регулировкой цвета", "с регулировкой яркости"])],
            },
            {
                label: "categories.lighting.spotLight",
                key: "tochechnie-svetilniki",
                default: {
                    name: "Точечное освещение",
                    englishName: "Spot light",
                },
                fields: [tags("tags", "Tags", ["с регулировкой цвета", "с регулировкой яркости"])],
            },
            {
                label: "categories.lighting.streetLamp",
                key: "ulichnie-fonari",
                default: {
                    name: "Уличный фонарь",
                    englishName: "Street lamp",
                },
                fields: [
                    select("type", "Type", ["подвесной", "настенный", "напольный"]),
                    tags("tags", "Tags", ["с регулировкой цвета", "с регулировкой яркости"]),
                ],
            },
            {
                label: "categories.lighting.outdoorWallLamp",
                key: "ulichnie-nastennie-svetilniki",
                default: {
                    name: "Уличный настенный светильник",
                    englishName: "Outdoor wall lamp",
                },
                fields: [tags("tags", "Tags", ["с регулировкой цвета", "с регулировкой яркости"])],
            },
            {
                label: "categories.lighting.outdoorFloorLamp",
                key: "ulichnie-napolnie-svetilniki",
                default: {
                    name: "Уличный напольный светильник",
                    englishName: "Outdoor floor lamp",
                },
                fields: [tags("tags", "Tags", ["с регулировкой цвета", "с регулировкой яркости"])],
            },
            {
                label: "categories.lighting.solarPoweredOutdoorLamp",
                key: "ulichnie-solnce",
                default: {
                    name: "Уличный светильник на солнечных батареях",
                    englishName: "Solar-powered outdoor lamp",
                },
                fields: [
                    select("type", "Type", ["подвесной", "настенный", "напольный"]),
                    tags("tags", "Tags", ["с регулировкой цвета", "с регулировкой яркости"]),
                ],
            },
            {
                label: "categories.lighting.outdoorDiodeLighting",
                key: "ulichnie-diodnie",
                default: {
                    name: "Уличное декоративное диодное освещение",
                    englishName: "Outdoor diode lighting",
                },
                fields: [tags("tags", "Tags", ["с регулировкой цвета", "с регулировкой яркости"])],
            },
        ],
    },
    {
        label: "categories.plumbing.label",
        key: "santeknika",
        defaultInterest: 0.3,
        children: [
            {
                label: "categories.plumbing.bath",
                key: "vanni",
                default: {
                    name: "Ванна",
                    englishName: "Bath",
                },
                fields: [
                    select("shape", "Shape", [
                        "круглая",
                        "овальная",
                        "прямоугольная",
                        "квадратная",
                        "угловая",
                        "другая",
                    ]),
                    select("type", "Type", ["классическая", "гидромассажная"]),
                    select("mount", "Mount type", ["встраиваемая", "классическая"]),
                ],
            },

            {
                label: "categories.plumbing.sink",
                key: "rakovini",
                default: {
                    name: "Раковина",
                    englishName: "Sink",
                },
                fields: [
                    select("type", "Type", ["тюльпан", "подвесная", "встроенная", "накладная", "угловая", "напольная"]),
                ],
            },
            {
                label: "categories.plumbing.toilet",
                key: "unitazi",
                default: {
                    name: "Унитаз",
                    englishName: "Toilet",
                },
                fields: [
                    select("type", "Type", ["смарт", "био", "классический"]),
                    select("typeOfTankMount", "Type of tank mount", [
                        "монолитный",
                        "раздельный",
                        "совместный",
                        "скрытый",
                    ]),
                    select("mount", "Mount", ["настенный", "напольный"]),
                ],
            },
            {
                label: "categories.plumbing.showerCabin",
                key: "dushevie-kabini",
                default: {
                    name: "Душевая кабина",
                    englishName: "Shower cabin",
                },
                fields: [select("type", "Type", ["открытые", "закрытые", "угловые", "комбинированные"])],
            },
            {
                label: "categories.plumbing.mixer",
                key: "smesiteli",
                default: {
                    name: "Смеситель",
                    englishName: "Mixer",
                },
                fields: [
                    select("type", "Type", ["двухвентильные", "однорычажные", "термостатические", "бесконтактные"]),
                ],
            },
            {
                label: "categories.plumbing.showerMixer",
                key: "dush",
                default: {
                    name: "Душ",
                    englishName: "Shower mixer",
                },
                fields: [
                    select("type", "Type", ["двухвентильные", "однорычажные", "термостатические", "бесконтактные"]),
                ],
            },
            {
                label: "categories.plumbing.jacuzzi",
                key: "zhakuzi",
                default: {
                    name: "Джакузи",
                    englishName: "Jacuzzi",
                },
                fields: [select("shape", "Shape", ["прямоугольная", "овальная", "треугольная"])],
            },
            {
                label: "categories.plumbing.sauna",
                key: "sauni",
                default: {
                    name: "Сауна",
                    englishName: "Sauna",
                },
                fields: [select("type", "Type", ["гибрид", "кабинка"])],
            },
            {
                label: "categories.plumbing.swimmingPool",
                key: "basseini",
                default: {
                    name: "Бассейн",
                    englishName: "Swimming pool",
                },
                fields: [select("type", "Type", ["надувной", "каркасный"])],
            },
            {
                label: "categories.plumbing.bidet",
                key: "bide",
                default: {
                    name: "Биде",
                    englishName: "Bidet",
                },
                fields: [select("type", "Type", ["напольное", "подвесное", "крышка-биде", "биде-приставка"])],
            },
            {
                label: "categories.plumbing.urinal",
                key: "pispis",
                default: {
                    name: "Писсуар",
                    englishName: "Urinal",
                },
                fields: [
                    select("flushType", "Flush type", ["ручная", "автоматическая"]),
                    select("mount", "Mount", ["настенный", "напольный"]),
                ],
            },
            {
                label: "categories.plumbing.hygienicShower",
                key: "gigienicheskii-dush",
                default: {
                    name: "Гигиенический душ",
                    englishName: "Hygienic shower",
                },
                fields: [tags("tags", "Tags", ["с регулировкой температуры"])],
            },
            {
                label: "categories.plumbing.bathroomAccessories",
                key: "accessuari-dlya-vanni",
            },
        ],
    },
    {
        label: "categories.homeAndGardenDecor.label",
        key: "dekor-dlya-doma-i-sada",
        defaultInterest: 0.3,
        children: [
            {
                label: "categories.homeAndGardenDecor.mirror",
                key: "zerkala",
                default: {
                    name: "Зеркало",
                    englishName: "Mirror",
                },
                fields: [
                    select("frame", "Frame", [], true), //TODO fix this
                    select("type", "Type", ["настенное", "напольное"]),
                    tags("tags", "Tags", ["сенсорное", "обычное"]),
                ],
            },
            {
                label: "categories.homeAndGardenDecor.carpet",
                key: "kovri",
                default: {
                    name: "Ковер",
                    englishName: "Carpet",
                },
            },
            {
                label: "categories.homeAndGardenDecor.vase",
                key: "vazi",
                default: {
                    name: "Ваза",
                    englishName: "Vase",
                },
            },
            {
                label: "categories.homeAndGardenDecor.figurine",
                key: "statuetki",
                default: {
                    name: "Статуэтка",
                    englishName: "Figurine",
                },
            },
            {
                label: "categories.homeAndGardenDecor.picture",
                key: "kartini",
                default: {
                    name: "Картина",
                    englishName: "Picture",
                },
            },
            {
                label: "categories.homeAndGardenDecor.dishes",
                key: "posuda",
            },
            {
                label: "categories.homeAndGardenDecor.hanger",
                key: "veshalki",
                default: {
                    name: "Вешалка",
                    englishName: "Hanger",
                },
            },
            {
                label: "categories.homeAndGardenDecor.umbrellaStand",
                key: "umbrella-stand",
                default: {
                    name: "Подставка под зонты",
                    englishName: "Umbrella stand",
                },
            },

            {
                label: "categories.homeAndGardenDecor.textile",
                key: "tekstil",
                default: {
                    name: "Текстиль",
                    englishName: "Textile",
                },
            },
            {
                label: "categories.homeAndGardenDecor.bedding",
                key: "bedding",
                default: {
                    name: "Постельное белье",
                    englishName: "Bedding",
                },
            },
            {
                label: "categories.homeAndGardenDecor.fireplace",
                key: "kamini",
                default: {
                    name: "Камин",
                    englishName: "Fireplace",
                },
            },
            {
                label: "categories.homeAndGardenDecor.clock",
                key: "chasi",
                default: {
                    name: "Часы",
                    englishName: "Clock",
                },
            },
            {
                label: "categories.homeAndGardenDecor.candlestick",
                key: "podsvechniki",
                default: {
                    name: "Подсвечник",
                    englishName: "Candlestick",
                },
            },
            {
                label: "categories.homeAndGardenDecor.foldingScreen",
                key: "accessuari-dlya-interera",
                default: {
                    name: "Ширма",
                    englishName: "Folding screen",
                },
            },
            {
                label: "categories.homeAndGardenDecor.fountain",
                key: "fontani",
                default: {
                    name: "Фонтан для дома",
                    englishName: "Fountain",
                },
            },
            {
                label: "categories.homeAndGardenDecor.outdoorFountain",
                key: "fontani-ulica",
                default: {
                    name: "Уличный фонтан",
                    englishName: "Outdoor fountain",
                },
            },
            {
                label: "categories.homeAndGardenDecor.outdoorStatue",
                key: "ulichnie-statuetki",
                default: {
                    name: "Уличная статуя",
                    englishName: "Outdoor statue",
                },
            },
            {
                label: "categories.homeAndGardenDecor.flowerPot",
                key: "ulichnie-gorshki",
                default: {
                    name: "Горшок для цветов",
                    englishName: "Flower pot",
                },
            },
            {
                label: "categories.homeAndGardenDecor.sunshade",
                key: "zonti",
                default: {
                    name: "Уличный зонт",
                    englishName: "Sunshade",
                },
            },
            {
                label: "categories.homeAndGardenDecor.artificialFlowers",
                key: "ulichnaya-trava",
                default: {
                    name: "Искусственные цветы",
                    englishName: "Artificial flowers",
                },
            },
        ],
    },
    {
        label: "categories.finishingAndBuildingMaterials.label",
        key: "otdelochnie-i-stroitelnie-materiali",
        defaultInterest: 0.3,
        children: [
            {
                label: "categories.finishingAndBuildingMaterials.ceramicTile",
                key: "plitkadom",
                params: {
                    price: "complex",
                },
                default: {
                    name: "Плитка керамическая",
                    englishName: "Ceramic tile",
                },
            },
            {
                label: "categories.finishingAndBuildingMaterials.flexibleСlinkerTile",
                key: "plitkaflex",
                params: {
                    price: "complex",
                },
                default: {
                    name: "Гибкая клинкерная плитка",
                    englishName: "Flexible clinker tile",
                },
            },
            {
                label: "categories.finishingAndBuildingMaterials.porcelainStoneware",
                key: "keramogranit",
                params: {
                    price: "complex",
                },
                default: {
                    name: "Керамогранит",
                    englishName: "Porcelain stoneware",
                },
            },
            {
                label: "categories.finishingAndBuildingMaterials.marble",
                key: "mramor",
                params: {
                    price: "complex",
                },
                default: {
                    name: "Мрамор",
                    englishName: "Marble",
                },
            },
            {
                label: "categories.finishingAndBuildingMaterials.mosaic",
                key: "mozaika",
                params: {
                    price: "complex",
                },
                default: {
                    name: "Мозаика",
                    englishName: "Mosaic",
                },
            },
            {
                label: "categories.finishingAndBuildingMaterials.naturalStone",
                key: "naturalniykamen",
                default: {
                    name: "Натуральный камень",
                    englishName: "Natural stone",
                },
            },
            {
                label: "categories.finishingAndBuildingMaterials.artificialStone",
                key: "iskuskamen",
                default: {
                    name: "Искусственный камень",
                    englishName: "Artificial stone",
                },
            },
            {
                label: "categories.finishingAndBuildingMaterials.laminate",
                key: "laminat",
                params: {
                    price: "complex",
                },
                default: {
                    name: "Ламинат",
                    englishName: "Laminate",
                },
            },
            {
                label: "categories.finishingAndBuildingMaterials.parquet",
                key: "parket",
                params: {
                    price: "complex",
                },
                default: {
                    name: "Паркет",
                    englishName: "Parquet",
                },
            },
            {
                label: "categories.finishingAndBuildingMaterials.wallpaper",
                key: "oboi",
                default: {
                    name: "Обои",
                    englishName: "Wallpaper",
                },
            },
            {
                label: "categories.finishingAndBuildingMaterials.window",
                key: "okna",
                default: {
                    name: "Окно",
                    englishName: "Window",
                },
            },
            {
                label: "categories.finishingAndBuildingMaterials.blinds",
                key: "zhalyuzi",
                default: {
                    name: "Жалюзи",
                    englishName: "Blinds",
                },
            },
            {
                label: "categories.finishingAndBuildingMaterials.door",
                key: "dveri",
                default: {
                    name: "Дверь",
                    englishName: "Door",
                },
            },
            {
                label: "categories.finishingAndBuildingMaterials.doorLock",
                key: "doorlocks",
                default: {
                    name: "Дверной замок",
                    englishName: "Door lock",
                },
            },
            {
                label: "categories.finishingAndBuildingMaterials.stepladder",
                key: "lestnici",
                default: {
                    name: "Лестница",
                    englishName: "Stepladder",
                },
            },
            {
                label: "categories.finishingAndBuildingMaterials.forgedProducts",
                key: "kovannoe",
            },
        ],
    },
];

const transform = (data, t) => {
    if (!Array.isArray(data) || data.length === 0) {
        return [];
    }
    return data.map(({key, label, children, ...params}) => ({
        value: key,
        label: t(label),
        children: children.map(child => ({
            ...child,
            value: child.key,
            label: t(child.label),
        })),
        ...params,
    }));
};
///export const productCategories = transform(categories);

export const standardFields = [
    {
        label: "Category",
        type: "tree",
        key: "category",
        options: [],
        warn: row => !Array.isArray(row.category) || row.category.length === 0,
        prepare: (a, b, t) => ({
            options: transform(categories, t),
        }),
    },
    {
        label: "Price per",
        type: "radio",
        key: "pricePer",
        options: [
            {
                value: "piece",
                label: "piece",
            },
            {
                value: "squareMeter",
                label: "㎡",
            },
        ],
        defaultValue: "squareMeter",
        hide: (data, cat) => cat?.params?.price !== "complex",
        //warn: row => row.price == null || row.price <= 0,
    },
    {
        label: "Price",
        type: "money",
        key: "price",
        warn: row => row.price == null || row.price <= 0,
    },
    {
        label: "Shipping cost",
        type: "number",
        key: "shipping",
        renderPreview: value => (typeof value === "number" ? `${dollars(value)}` : "Same with supplier"),
    },
    {
        label: "Name",
        type: "text",
        key: "name",
        warn: row => typeof row.name !== "string" || row.name.length === 0,
    },
    {
        label: "English name",
        type: "text",
        key: "englishName",
        warn: row => typeof row.name !== "string" || row.name.length === 0,
    },
    {
        label: "Original ID",
        type: "text",
        key: "factoryTag",
    },
    {
        label: "Interest",
        type: "number",
        key: "interest",
        renderPreview: value => (typeof value === "number" ? `${value * 100} %` : "Same with supplier"),
        beforeSave: value => (typeof value === "number" ? Math.round(value) / 100 : null),
        valueModifier: value => (value == null ? value : value * 100),
        params: {
            min: 0,
            step: 10,
            max: 100,
        },
    },
    {
        label: "Set",
        type: "text",
        key: "set",
    },
    {
        label: "Photos",
        type: "images",
        key: "photos",
        params: {
            max: 10,
        },
    },
    {
        label: "Size",
        type: "text",
        key: "size",
    },
    {
        label: "Volume",
        key: "volume",
        type: "square",
        params: {
            unit: "m³",
        },
    },
    {
        label: "Weight",
        key: "weight",
        type: "square",
        params: {
            unit: "kg",
        },
    },
    {
        label: "Materials",
        key: "materials",
        options: [],
        type: "select",
        params: {
            mode: "multiple",
        },
        prepare: (data, {materials = []}) => {
            return {
                options: materials
                    .map(word => ({
                        label: firstSuitable([word[i18next.language], word.en, word.key]),
                        value: word.key,
                    }))
                    .sort(sorter),
                renderPreview: value =>
                    value
                        ?.map(key => {
                            const word = materials.find(w => w.key === key);
                            if (word == null) {
                                return key;
                            }
                            return firstSuitable([word[i18next.language], word.en, word.key]);
                        })
                        ?.join(", "),
            };
        },
    },
    {
        label: "Brand",
        key: "brand",
        options: [],
        type: "select",
        prepare: (data, {brands = []}) => {
            return {
                options: brands
                    .map(word => ({
                        label: firstSuitable([word[i18next.language], word.en, word.key]),
                        value: word.key,
                    }))
                    .sort(sorter),
                renderPreview: key => {
                    const word = brands.find(w => w.key === key);
                    if (word == null) {
                        return key;
                    }
                    return firstSuitable([word[i18next.language], word.en, word.key]);
                },
            };
        },
    },
    {
        label: "Style",
        key: "styles",
        options: [],
        type: "choice",
        params: {
            showName: true,
            multipleChoice: true,
        },
        prepare: (data, {styles = []}) => {
            return {
                options: styles
                    .map(word => ({
                        label: firstSuitable([word[i18next.language], word.en, word.key]),
                        value: word.key,
                    }))
                    .sort(sorter),
            };
        },
    },
    {
        label: "Business",
        key: "businesses",
        options: [],
        type: "choice",
        params: {
            showName: true,
            multipleChoice: true,
        },
        prepare: (data, {businesses = []}) => {
            return {
                options: businesses
                    .map(word => ({
                        label: firstSuitable([word[i18next.language], word.en, word.key]),
                        value: word.key,
                    }))
                    .sort(sorter),
            };
        },
    },
    {
        label: "Room",
        key: "rooms",
        options: [],
        type: "choice",
        params: {
            showName: true,
            multipleChoice: true,
        },
        prepare: (data, {rooms = []}) => {
            return {
                options: rooms
                    .map(word => ({
                        label: firstSuitable([word[i18next.language], word.en, word.key]),
                        value: word.key,
                    }))
                    .sort(sorter),
            };
        },
    },
    // tags("styles", "Style", styles),
    // tags("businesses", "Business", businesses),
    // tags("room", "Room", rooms),
];

const getCategory = category => {
    if (Array.isArray(category) && category.length === 2) {
        const first = categories.find(cat => cat.key === category[0]);
        return first?.children?.find(cat => cat.key === category[1]);
    }
};

export const generateProductFields = (data, options, t) => {
    const {category} = data;
    const cat = getCategory(category);
    const additionalFields = cat?.fields ?? [];

    return [
        ...standardFields
            .filter(field => typeof field.hide !== "function" || !field.hide(data, cat))
            .map(({hide, ...field}) => {
                if (typeof field.prepare !== "function") {
                    return field;
                } else {
                    const {prepare, ...cleanField} = field;
                    return {
                        ...cleanField,
                        ...prepare(data, options ?? {}, t),
                    };
                }
            }),
        ...additionalFields,
    ];
};
