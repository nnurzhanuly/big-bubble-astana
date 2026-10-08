"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { type Work } from "@/lib/content";

type Props = {
  open: boolean;
  work: Work | null;
  onClose: () => void;
};

type OrderState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success"; id: string }
  | { kind: "error"; message: string };

export default function OrderDialog({ open, work, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<OrderState>({ kind: "idle" });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setState({ kind: "idle" });
      formRef.current?.reset();
      const occasion = formRef.current?.elements.namedItem("occasion");
      if (occasion instanceof HTMLSelectElement) occasion.value = work?.category ?? "";
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, work]);

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    setState({ kind: "sending" });

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          phone: String(data.get("phone") ?? ""),
          occasion: String(data.get("occasion") ?? ""),
          date: String(data.get("date") ?? ""),
          details: String(data.get("details") ?? ""),
          workId: work?.id ?? null,
          website: String(data.get("website") ?? ""),
        }),
      });
      const result: { id?: string; error?: string } = await response.json();
      if (!response.ok || !result.id) {
        throw new Error(result.error || "Не удалось сохранить заявку. Попробуйте ещё раз.");
      }
      setState({ kind: "success", id: result.id });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Не удалось сохранить заявку. Попробуйте ещё раз.",
      });
    }
  }

  return (
    <dialog
      className="order-dialog"
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current?.close(); }}
      aria-labelledby="order-title"
    >
      <button className="order-dialog__close" type="button" aria-label="Закрыть заявку" onClick={() => dialogRef.current?.close()}>×</button>
      {state.kind === "success" ? (
        <div className="order-success" role="status">
          <span className="order-success__mark" aria-hidden="true">✓</span>
          <p className="eyebrow">Заявка сохранена</p>
          <h2 id="order-title">Спасибо! Номер заявки — {state.id}</h2>
          <p>Заявка сохранена. Запишите номер — по нему можно найти ваше обращение.</p>
          <button className="button button--pink" type="button" onClick={() => dialogRef.current?.close()}>Вернуться на сайт</button>
        </div>
      ) : (
        <div className="order-dialog__layout">
          <div className="order-dialog__intro">
            <p className="eyebrow">Big Bubble · Астана</p>
            <h2 id="order-title">Расскажите о вашем празднике</h2>
            <p>Оставьте детали, чтобы мы могли подобрать оформление и уточнить стоимость.</p>
            {work && (
              <div className="order-dialog__work">
                <span className="order-dialog__work-image"><Image src={work.image} alt={work.alt} fill sizes="80px" className="object-cover" /></span>
                <span><small>Вы выбрали работу</small><strong>{work.title}</strong></span>
              </div>
            )}
          </div>
          <form className="order-form" ref={formRef} onSubmit={submitOrder}>
            <label>Ваше имя <input name="name" type="text" autoComplete="name" minLength={2} maxLength={80} required placeholder="Как к вам обращаться" /></label>
            <label>Номер телефона <input name="phone" type="tel" autoComplete="tel" inputMode="tel" minLength={10} maxLength={24} required placeholder="+7 700 000 00 00" /></label>
            <div className="order-form__row">
              <label>Повод <select name="occasion" defaultValue="" required><option value="" disabled>Выберите повод</option><option value="birthday">День рождения</option><option value="birth">Выписка</option><option value="decor">Оформление события</option><option value="gifts">Подарок</option><option value="other">Другое</option></select></label>
              <label>Дата, если известна <input name="date" type="date" /></label>
            </div>
            <label>Пожелания <textarea name="details" rows={4} maxLength={500} placeholder="Цвета, адрес, количество гостей или другие детали" /></label>
            <label className="order-form__honeypot" aria-hidden="true">Сайт <input name="website" tabIndex={-1} autoComplete="off" /></label>
            <p className="order-form__notice">Контактные данные используются только для ответа по этой заявке. Оплата на этом этапе не требуется.</p>
            {state.kind === "error" && <p className="order-form__error" role="alert">{state.message}</p>}
            <button className="button button--pink" type="submit" disabled={state.kind === "sending"}>{state.kind === "sending" ? "Сохраняем…" : "Отправить заявку"}<span aria-hidden="true">→</span></button>
          </form>
        </div>
      )}
    </dialog>
  );
}
