import { randomUUID } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { works } from "@/lib/content";

export const runtime = "nodejs";

const occasions = new Set(["birthday", "birth", "decor", "gifts", "other"]);

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 8_000) {
    return NextResponse.json({ error: "Заявка слишком длинная." }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    const value: unknown = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid body");
    body = value as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Некорректные данные заявки." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const occasion = typeof body.occasion === "string" ? body.occasion : "";
  const date = typeof body.date === "string" ? body.date : "";
  const details = typeof body.details === "string" ? body.details.trim() : "";
  const workId = typeof body.workId === "string" ? body.workId : null;
  const website = typeof body.website === "string" ? body.website : "";

  if (website) return NextResponse.json({ id: "BB-OK" });
  if (name.length < 2 || name.length > 80 || /[\r\n]/.test(name)) {
    return NextResponse.json({ error: "Введите имя от 2 до 80 символов." }, { status: 400 });
  }
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 12 || !/^[+\d\s()\-]+$/.test(phone)) {
    return NextResponse.json({ error: "Проверьте номер телефона." }, { status: 400 });
  }
  if (!occasions.has(occasion)) {
    return NextResponse.json({ error: "Выберите повод." }, { status: 400 });
  }
  const parsedDate = date ? new Date(`${date}T00:00:00.000Z`) : null;
  if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !parsedDate || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date)) {
    return NextResponse.json({ error: "Проверьте дату." }, { status: 400 });
  }
  if (details.length > 500 || (workId && !works.some((work) => work.id === workId))) {
    return NextResponse.json({ error: "Проверьте детали заявки." }, { status: 400 });
  }

  const id = `BB-${randomUUID().slice(0, 8).toUpperCase()}`;
  const record = { id, createdAt: new Date().toISOString(), name, phone, occasion, date: date || null, details, workId };

  try {
    const directory = path.join(process.cwd(), "data");
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await appendFile(path.join(directory, "requests.jsonl"), `${JSON.stringify(record)}\n`, { encoding: "utf8", mode: 0o600 });
  } catch {
    return NextResponse.json({ error: "Сохранение временно недоступно. Попробуйте позже." }, { status: 500 });
  }

  return NextResponse.json({ id }, { status: 201 });
}
