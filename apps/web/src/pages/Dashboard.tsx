import { useState } from "react";
import { Link } from "react-router-dom";
import { useDeleteShift, useShifts, useStats, type Period } from "../api";
import { StatCard } from "../components/StatCard";
import { dateHr, eur, hoursFmt, weekdayHr } from "../lib/format";

const PERIODS: { key: Period; label: string }[] = [
  { key: "week", label: "Tjedan" },
  { key: "month", label: "Mjesec" },
  { key: "all", label: "Sve" },
];

export function Dashboard() {
  const [period, setPeriod] = useState<Period>("week");
  const stats = useStats(period);
  const shifts = useShifts();
  const del = useDeleteShift();

  return (
    <div className="stack">
      <div className="row-between">
        <h1 className="page-title">Pregled</h1>
        <div className="segmented" role="tablist" aria-label="Razdoblje">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              role="tab"
              aria-selected={period === p.key}
              className={`segmented__btn${period === p.key ? " is-active" : ""}`}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {stats.isLoading && <p className="muted">Učitavanje statistike…</p>}
      {stats.isError && <p className="error">Statistiku nije moguće dohvatiti.</p>}
      {stats.data && (
        <div className="stats-grid">
          <StatCard
            accent
            label="Napojnice"
            value={eur(stats.data.totalTips)}
            sub={`${eur(stats.data.totalCash)} gotovina · ${eur(stats.data.totalCard)} kartica`}
          />
          <StatCard label="Po satu" value={eur(stats.data.tipsPerHour)} sub="prosječno €/h" />
          <StatCard label="Sati" value={hoursFmt(stats.data.totalHours)} sub="ukupno odrađeno" />
          <StatCard label="Smjene" value={String(stats.data.shiftCount)} sub="u razdoblju" />
        </div>
      )}

      <div className="row-between">
        <h2 className="section-title">Smjene</h2>
        <Link to="/smjene/nova" className="btn btn--ghost btn--sm">+ Nova</Link>
      </div>

      {shifts.isLoading && <p className="muted">Učitavanje smjena…</p>}
      {shifts.isError && <p className="error">Smjene nije moguće dohvatiti.</p>}
      {shifts.data?.length === 0 && (
        <div className="empty">
          <p className="muted">Još nema unesenih smjena.</p>
          <Link to="/smjene/nova" className="btn btn--primary">Dodaj prvu smjenu</Link>
        </div>
      )}
      {shifts.data && shifts.data.length > 0 && (
        <ul className="shift-list">
          {shifts.data.map((s) => (
            <li key={s.id} className="shift">
              <div className="shift__main">
                <div className="shift__date">
                  <span className="shift__day">{dateHr(s.date)}</span>
                  <span className="muted shift__weekday">
                    {weekdayHr(s.date)} · {s.startTime}–{s.endTime} · {hoursFmt(s.hours)}
                    {s.venue ? ` · ${s.venue}` : ""}
                  </span>
                </div>
                <div className="shift__tips">
                  <span className="shift__amount">{eur(s.tipsCash + s.tipsCard)}</span>
                  <span className="muted shift__split">
                    {eur(s.tipsCash)} G · {eur(s.tipsCard)} K
                  </span>
                </div>
              </div>
              <div className="shift__actions">
                <Link to={`/smjene/${s.id}`} className="btn btn--ghost btn--sm">Uredi</Link>
                <button
                  className="btn btn--danger btn--sm"
                  onClick={() => del.mutate(s.id)}
                  disabled={del.isPending}
                >
                  Obriši
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
