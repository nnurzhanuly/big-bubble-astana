import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
export const metadata: Metadata = { title: "Контакты и индивидуальный заказ" };
export default function Page() { return <main id="main" className="container simple-page"><nav className="breadcrumbs"><Link href="/">Главная</Link><span>/</span>Контакты</nav><div className="contact-grid"><div><span className="shop-eyebrow">Ваш повод особенный</span><h1>Давайте создадим<br/><em>его вместе.</em></h1><p>Расскажите о празднике, цветах и настроении. Мы подготовим предложение и уточним детали по телефону.</p><div className="contact-steps"><div><strong>01</strong><span>Оставьте запрос на сайте</span></div><div><strong>02</strong><span>Мы уточним состав и стоимость</span></div><div><strong>03</strong><span>Согласуем дату и получение</span></div></div></div><ContactForm/></div></main>; }
