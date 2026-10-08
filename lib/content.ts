export type Category = "all" | "birthday" | "birth" | "decor" | "gifts";
export type Product = {
  id: string;
  category: Exclude<Category, "all">;
  categoryLabel: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  price: number;
  badge?: string;
  details: string[];
};
export type Work = Product;
export const categories: { id: Category; label: string; image?: string }[] = [
  { id: "all", label: "Все товары" },
  { id: "birthday", label: "День рождения", image: "/images/birthday-balloon.jpg" },
  { id: "birth", label: "Выписка", image: "/images/gold-pink-balloons.jpg" },
  { id: "decor", label: "Арки и оформление", image: "/images/hero-arch.jpg" },
  { id: "gifts", label: "Подарки и сюрпризы", image: "/images/heart-balloon.jpg" },
];
export const products: Product[] = [
  { id: "pink-arch", category: "decor", categoryLabel: "Арки и оформление", title: "Арка в розовой гамме", description: "Воздушная арка для входной зоны или фотозоны. Цвета и размер подбираются под событие.", image: "/images/hero-arch.jpg", alt: "Розовая арка из воздушных шаров", price: 49000, badge: "Популярное", details: ["Индивидуальная палитра", "Подбор размера под площадку", "Монтаж согласовывается отдельно"] },
  { id: "birthday-balloon", category: "birthday", categoryLabel: "День рождения", title: "Шар с персональной надписью", description: "Большой светлый шар с вашим поздравлением и декоративными деталями.", image: "/images/birthday-balloon.jpg", alt: "Светлый шар с надписью Happy Birthday", price: 12500, badge: "Хит", details: ["Надпись под ваш повод", "Цвет банта на выбор", "Текст уточним после заказа"] },
  { id: "pink-gold", category: "birth", categoryLabel: "Выписка", title: "Розовый и золото", description: "Нежная композиция из шаров для встречи малыша дома или у роддома.", image: "/images/gold-pink-balloons.jpg", alt: "Розовые, белые и золотые шары", price: 26500, details: ["Палитра меняется по желанию", "Состав уточняется перед подготовкой", "Можно добавить персональную надпись"] },
  { id: "entrance-arch", category: "decor", categoryLabel: "Арки и оформление", title: "Оформление входа", description: "Акцентная арка для открытия, дня рождения или семейного торжества.", image: "/images/entrance-arch.jpg", alt: "Светлая арка из шаров у входа", price: 59000, details: ["Для помещений и входных зон", "Индивидуальная палитра", "Замер и монтаж обсуждаются"] },
  { id: "silver-balloons", category: "birthday", categoryLabel: "День рождения", title: "Серебро и белый", description: "Композиция в спокойной праздничной палитре для дома и фотосессии.", image: "/images/silver-balloons.jpg", alt: "Серебристые и белые воздушные шары", price: 22500, details: ["Палитра на выбор", "Подходит для дома и студии", "Состав уточняется"] },
  { id: "gift-box", category: "gifts", categoryLabel: "Подарки и сюрпризы", title: "Сюрприз в коробке", description: "Подарочная коробка с воздушными шарами для неожиданного поздравления.", image: "/images/gift-box.webp", alt: "Подарочная коробка с шарами", price: 18500, details: ["Оформление под получателя", "Наполнение обсуждается", "Персональное поздравление"] },
  { id: "room-surprise", category: "birthday", categoryLabel: "День рождения", title: "Сюрприз в комнате", description: "Шары и акценты для атмосферы праздника с первого взгляда.", image: "/images/room-decor.jpg", alt: "Комната украшена шарами", price: 36000, details: ["Оформление по размерам комнаты", "Цветовая гамма на выбор", "Монтаж обсуждается"] },
  { id: "characters", category: "gifts", categoryLabel: "Подарки и сюрпризы", title: "Любимые персонажи", description: "Яркие фольгированные фигуры для детского праздника.", image: "/images/characters.jpg", alt: "Фольгированные шары в форме персонажей", price: 14500, details: ["Персонажи по наличию", "Композиция под возраст", "Можно дополнить шарами"] },
  { id: "event-decor", category: "decor", categoryLabel: "Арки и оформление", title: "Большой повод", description: "Оформление пространства для важного торжества.", image: "/images/event-decor.jpg", alt: "Праздничное оформление события", price: 79000, details: ["Подготовка под площадку", "Индивидуальный декор", "Стоимость зависит от масштаба"] },
  { id: "heart-balloon", category: "gifts", categoryLabel: "Подарки и сюрпризы", title: "Шары в форме сердца", description: "Лёгкий и красивый способ сказать о своих чувствах.", image: "/images/heart-balloon.jpg", alt: "Воздушный шар в форме сердца", price: 9500, details: ["Цвет на выбор", "Подходит для подарка", "Дополнительная надпись по запросу"] },
  { id: "first-birthday", category: "birthday", categoryLabel: "День рождения", title: "Первый день рождения", description: "Нежная композиция к самому первому празднику малыша.", image: "/images/first-birthday.jpg", alt: "Шары для первого дня рождения", price: 29000, details: ["Цифра и палитра на выбор", "Персональные детали", "Состав уточняется"] },
  { id: "balloon-bouquet", category: "birth", categoryLabel: "Выписка", title: "Букет из шаров", description: "Компактная праздничная композиция для тёплой встречи.", image: "/images/balloon-bouquet.jpg", alt: "Букет из воздушных шаров", price: 16500, details: ["Палитра на выбор", "Композиция под повод", "Можно добавить открытку"] },
];
export const works: Work[] = products;
export const formatPrice = (price: number) => new Intl.NumberFormat("ru-RU").format(price) + " ₸";
