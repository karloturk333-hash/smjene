import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateShift, useShift, useUpdateShift, type ShiftInput } from "../api";

interface FormState {
  date: string;
  startTime: string;
  endTime: string;
  tipsCash: number;
  tipsCard: number;
  guests: number;
  venue: string;
  note: string;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

const INITIAL: FormState = {
  date: todayISO(),
  startTime: "16:00",
  endTime: "23:00",
  tipsCash: 0,
  tipsCard: 0,
  guests: 0,
  venue: "",
  note: "",
};

export function ShiftFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const existing = useShift(id);
  const create = useCreateShift();
  const update = useUpdateShift(id ?? "");

  const [form, setForm] = useState<FormState>(INITIAL);

  useEffect(() => {
    if (existing.data) {
      const s = existing.data;
      setForm({
        date: s.date.slice(0, 10),
        startTime: s.startTime,
        endTime: s.endTime,
        tipsCash: s.tipsCash,
        tipsCard: s.tipsCard,
        guests: s.guests,
        venue: s.venue ?? "",
        note: s.note ?? "",
      });
    }
  }, [existing.data]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const pending = create.isPending || update.isPending;
  const error = (create.error || update.error) as Error | null;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload: ShiftInput = {
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      tipsCash: form.tipsCash,
      tipsCard: form.tipsCard,
      guests: form.guests,
      venue: form.venue.trim() || undefined,
      note: form.note.trim() || undefined,
    };
    const mut = isEdit ? update : create;
    mut.mutate(payload, { onSuccess: () => navigate("/") });
  }

  return (
    <div className="stack form-page">
      <h1 className="page-title">{isEdit ? "Uredi smjenu" : "Nova smjena"}</h1>
      <form className="card form" onSubmit={onSubmit}>
        <label className="field">
          <span>Datum</span>
          <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Početak</span>
            <input type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} required />
          </label>
          <label className="field">
            <span>Kraj</span>
            <input type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} required />
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>Napojnice — gotovina (€)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.tipsCash}
              onChange={(e) => set("tipsCash", Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span>Napojnice — kartica (€)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.tipsCard}
              onChange={(e) => set("tipsCard", Number(e.target.value))}
            />
          </label>
        </div>

        <label className="field">
          <span>Broj gostiju</span>
          <input
            type="number"
            min="0"
            step="1"
            value={form.guests}
            onChange={(e) => set("guests", Number(e.target.value))}
          />
        </label>

        <label className="field">
          <span>Lokal</span>
          <input
            type="text"
            value={form.venue}
            onChange={(e) => set("venue", e.target.value)}
            placeholder="npr. Konoba More"
          />
        </label>

        <label className="field">
          <span>Bilješka</span>
          <textarea value={form.note} onChange={(e) => set("note", e.target.value)} rows={2} />
        </label>

        {error && <p className="error">{error.message}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate("/")}>
            Odustani
          </button>
          <button type="submit" className="btn btn--primary" disabled={pending}>
            {pending ? "Spremanje…" : isEdit ? "Spremi promjene" : "Spremi smjenu"}
          </button>
        </div>
      </form>
    </div>
  );
}
