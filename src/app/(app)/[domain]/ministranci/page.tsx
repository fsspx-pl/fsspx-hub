"use client";

import React, { useMemo, useState } from "react";

/** ====== Typy ====== */

type MassFunction = {
  nazwa: string;
};

type MassType = {
  nazwa: string;
  funkcje: MassFunction[];
};

type MassHour = {
  godzina: string; // np. "09:00"
  typ: MassType; // typ Mszy (z listą funkcji)
  zapisy: Map<string, string[]>; // { [nazwaFunkcji]: [listaOsob] }
};

type DaySchedule = {
  data: Date;
  msze: MassHour[];
};

/** ====== Stałe i utils ====== */
const NAZWY_DNI: string[] = [
  "Niedziela",
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
];

const BIEŻĄCY_UŻYTKOWNIK = "Miłosz M";

const MASS_TYPES: MassType[] = [
  {
    nazwa: "Msza św. czytana",
    funkcje: [{ nazwa: "Ministrant I" }, { nazwa: "Ministrant II" }],
  },
  {
    nazwa: "Msza św. śpiewana",
    funkcje: [
      { nazwa: "Ceremoniarz" },
      { nazwa: "Turyferariusz" },
      { nazwa: "Akolita I" },
      { nazwa: "Akolita II" },
      { nazwa: "Krucyfer" },
      { nazwa: "Nawikulariusz" },
      { nazwa: "Ceroferariusz I" },
      { nazwa: "Ceroferariusz II" },
      { nazwa: "Ceroferariusz III" },
      { nazwa: "Ceroferariusz IV" },
      { nazwa: "Ceroferariusz V" },
      { nazwa: "Ceroferariusz VI" },
    ],
  },
  {
    nazwa: "Adoracja Najśw. Sakramentu",
    funkcje: [{ nazwa: "Ministrant I" }, { nazwa: "Ministrant II" }],
  },
];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function formatPL(d: Date) {
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}
function addDays(base: Date, delta: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + delta);
  return d;
}
function startOfWeekSunday(base: Date) {
  const d = new Date(base);
  const diff = d.getDay(); // 0..6 (0 = niedziela)
  const start = addDays(
    new Date(d.getFullYear(), d.getMonth(), d.getDate()),
    -diff
  );
  start.setHours(0, 0, 0, 0);
  return start;
}
function isPastDay(day: Date, today: Date) {
  const d = new Date(day);
  const t = new Date(today);
  d.setHours(0, 0, 0, 0);
  t.setHours(0, 0, 0, 0);
  return d.getTime() < t.getTime();
}

/** Prosty PRNG z seedem */
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** ====== Generowanie przykładowych danych (bez prawdziwego backendu) ====== */
function generateExampleWeekData(weekStart: Date): DaySchedule[] {
  const seed = new Date(weekStart).getTime();
  const rnd = mulberry32(seed);

  const godzinyNiedziela = ["08:00", "10:00", "18:00"];
  const godzinyZwykle = ["07:15", "18:00", "18:40"];
  const exampleNames = [
    "Piotr N",
    "Paweł N",
    "Tomasz N",
    "Ignacy A",
    "Kacper T",
    "Marian Z",
    "Michał W",
    "Mateusz N",
    "Wiktor H",
    "Grzegorz S",
    "Tymon T",
  ];

  const days: DaySchedule[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const isSunday = i === 0;
    const godziny = isSunday ? godzinyNiedziela : godzinyZwykle;

    const msze: MassHour[] = godziny.map((g) => {
      // Wybór typu Mszy
      let typ: MassType = MASS_TYPES[0];
      if (isSunday && g === "10:00") {
        typ = MASS_TYPES[1];
      } else if (g === "18:40") {
        typ = MASS_TYPES[2];
      } else {
        typ = MASS_TYPES[0];
      }

      // Losowe zapisy oddzielnie od definicji funkcji
      const zapisy = new Map<string, string[]>();
      for (const f of typ.funkcje) {
        const count =
          rnd() > 0.65 ? (rnd() > 0.5 ? 2 : 1) : rnd() > 0.9 ? 3 : 0;
        zapisy.set(
          f.nazwa,
          Array.from({ length: count }, () => {
            const idx = Math.floor(rnd() * exampleNames.length);
            return exampleNames[idx];
          })
        );
      }

      return { godzina: g, typ, zapisy };
    });

    days.push({ data: date, msze });
  }
  return days;
}

/** ====== Komponent strony ====== */
export default function MinistranciPage() {
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [data, setData] = useState<DaySchedule[]>(() => {
    const start = startOfWeekSunday(new Date());
    return generateExampleWeekData(start);
  });

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const weekStart = useMemo(
    () => addDays(startOfWeekSunday(today), 7 * weekOffset),
    [today, weekOffset]
  );
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  React.useEffect(() => {
    setData(generateExampleWeekData(weekStart));
  }, [weekStart]);

  function zapiszMnie(dayIdx: number, massIdx: number, nazwaFunkcji: string) {
    setData((prev) =>
      prev.map((d, di) => {
        if (di !== dayIdx) return d;
        return {
          ...d,
          msze: d.msze.map((m, mi) => {
            if (mi !== massIdx) return m;

            if (m.zapisy.get(nazwaFunkcji)?.includes(BIEŻĄCY_UŻYTKOWNIK)) {
              return m;
            }

            const newZapisy = new Map(
              Array.from(m.zapisy.entries()).map(([funkcja, osoby]) => [
                funkcja,
                funkcja === nazwaFunkcji
                  ? [...osoby, BIEŻĄCY_UŻYTKOWNIK]
                  : osoby.filter((o) => o !== BIEŻĄCY_UŻYTKOWNIK),
              ])
            );

            return { ...m, zapisy: newZapisy };
          }),
        };
      })
    );
  }

  function wypiszMnie(dayIdx: number, massIdx: number) {
    setData((prev) =>
      prev.map((d, di) => {
        if (di !== dayIdx) return d;
        return {
          ...d,
          msze: d.msze.map((m, mi) => {
            if (mi !== massIdx) return m;

            const newZapisy = new Map(
              Array.from(m.zapisy.entries()).map(([funkcja, osoby]) => [
                funkcja,
                osoby.filter((o) => o !== BIEŻĄCY_UŻYTKOWNIK),
              ])
            );

            return { ...m, zapisy: newZapisy };
          }),
        };
      })
    );
  }

  function mszaMaZapisanych(m: MassHour) {
    return m.typ.funkcje.some((f) => (m.zapisy.get(f.nazwa)?.length || 0) > 0);
  }

  function mszaMaBiezacegoUzytkownika(m: MassHour) {
    return m.typ.funkcje.some((f) =>
      m.zapisy.get(f.nazwa)?.includes(BIEŻĄCY_UŻYTKOWNIK)
    );
  }

  return (
    <main className="page">
      <header className="header">
        <button
          className="nav"
          onClick={() => setWeekOffset((o) => o - 1)}
          aria-label="Poprzedni tydzień"
        >
          ← Poprzedni
        </button>

        <div className="range" aria-live="polite">
          {formatPL(weekStart)} — {formatPL(weekEnd)}
        </div>

        <button
          className="nav"
          onClick={() => setWeekOffset((o) => o + 1)}
          aria-label="Następny tydzień"
        >
          Następny →
        </button>
      </header>

      <h1 className="title">Ministranci — zapisy na służbę</h1>

      <section className="week">
        {data.map((dz, dIdx) => {
          const past = isPastDay(dz.data, today);
          return (
            <div key={dIdx} className={`dayCard ${past ? "past" : ""}`}>
              <table
                className="dayTable"
                aria-label={`${NAZWY_DNI[dIdx]} ${formatPL(dz.data)}`}
              >
                <caption>
                  <div className="dayHeader">
                    <span className="dayName">{NAZWY_DNI[dIdx]}</span>
                    <span className="dayDate">{formatPL(dz.data)}</span>
                  </div>
                </caption>
                <tbody>
                  <tr className="hoursRow">
                    {dz.msze.map((m, mIdx) => {
                      const massHasAny = mszaMaZapisanych(m);
                      const massHasCurrentUser = mszaMaBiezacegoUzytkownika(m);
                      return (
                        <td key={mIdx} className="hourCell">
                          <div
                            className={`massCard ${massHasAny ? "hasAny" : "noAny"}`}
                          >
                            <table className="massTable">
                              <thead>
                                <tr className="massHeader">
                                  <th colSpan={2}>
                                    <div className="massHeaderRow">
                                      <div className="timeWrap">
                                        <span className="time">
                                          {m.godzina}
                                        </span>
                                        <span className="type">
                                          {m.typ.nazwa}
                                        </span>
                                      </div>
                                      <div className="actions">
                                        {massHasCurrentUser ? (
                                          <button
                                            className="joinBtn"
                                            aria-label={`Wypisz mnie z ${m.godzina}`}
                                            onClick={(e) => {
                                              e.preventDefault();
                                              if (past) return;
                                              wypiszMnie(dIdx, mIdx);
                                            }}
                                            disabled={past}
                                          >
                                            Wypisz mnie
                                          </button>
                                        ) : (
                                          <details className="joinMenu">
                                            <summary
                                              className="joinBtn"
                                              aria-label={`Zapisz mnie na ${m.godzina}`}
                                              role="button"
                                            >
                                              Zapisz mnie
                                            </summary>
                                            <div className="menu">
                                              <div className="menuLabel">
                                                Wybierz funkcję:
                                              </div>
                                              {m.typ.funkcje.map((f) => (
                                                <button
                                                  key={f.nazwa}
                                                  className="menuItem"
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    if (past) return;
                                                    zapiszMnie(
                                                      dIdx,
                                                      mIdx,
                                                      f.nazwa
                                                    );
                                                    (
                                                      e.currentTarget.closest(
                                                        "details"
                                                      ) as HTMLDetailsElement
                                                    )?.removeAttribute("open");
                                                  }}
                                                  disabled={past}
                                                >
                                                  {f.nazwa}
                                                  <span className="count">
                                                    {m.zapisy.get(f.nazwa)
                                                      ?.length || 0}
                                                  </span>
                                                </button>
                                              ))}
                                            </div>
                                          </details>
                                        )}
                                      </div>
                                    </div>
                                  </th>
                                </tr>
                                <tr>
                                  <th className="colHead">Funkcja</th>
                                  <th className="colHead">Osoby zapisane</th>
                                </tr>
                              </thead>
                              <tbody>
                                {m.typ.funkcje.map((f) => {
                                  const osoby = m.zapisy.get(f.nazwa) ?? [];
                                  const has = osoby.length > 0;
                                  return (
                                    <tr
                                      key={f.nazwa}
                                      className={has ? "hasPeople" : "noPeople"}
                                    >
                                      <td className="fnCell">{f.nazwa}</td>
                                      <td className="peopleCell">
                                        {has ? (
                                          <span className="peopleList">
                                            {osoby.join(", ")}
                                            {osoby.includes(
                                              BIEŻĄCY_UŻYTKOWNIK
                                            ) ? (
                                              <em className="you"> (Ty)</em>
                                            ) : null}
                                          </span>
                                        ) : (
                                          <span className="empty">
                                            — brak —
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </section>

      <style jsx>{`
        .page {
          --bg: #ffffff;
          --text: #202124;
          --muted: #5f6368;
          --border: #dadce0;

          --green-verylight: #eaf7ea;
          --red-verylight: #ffe8e8;

          --past-fg: #9aa0a6;
          --past-border: #e0e3e7;
          --past-bg: #f5f6f7;

          --radius: 12px;

          padding: 16px 12px 40px;
          color: var(--text);
          background: var(--bg);
          max-width: 1200px;
          margin: 0 auto;
        }

        .title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 10px 0 16px;
        }

        .header {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 8px;
          position: sticky;
          top: 0;
          background: var(--bg);
          padding: 10px 0;
          z-index: 2;
        }
        .nav {
          justify-self: start;
          border: 1px solid var(--border);
          background: #fff;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 0.95rem;
          cursor: pointer;
        }
        .nav:last-of-type {
          justify-self: end;
        }
        .nav:hover {
          background: #fafafa;
        }
        .range {
          text-align: center;
          font-weight: 600;
          letter-spacing: 0.2px;
        }

        /* Jeden dzień = jeden wiersz (również na laptopie) */
        .week {
          display: grid;
          grid-template-columns: 1fr; /* zawsze pojedyncza kolumna */
          gap: 16px;
        }

        .dayCard {
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          background: #fff;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        .dayTable {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .dayTable caption {
          text-align: left;
          padding: 12px 14px;
          background: #fafafa;
          border-bottom: 1px solid var(--border);
        }
        .dayHeader {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        .dayName {
          font-weight: 700;
        }
        .dayDate {
          color: var(--muted);
          font-size: 0.95rem;
        }

        /* Godziny: na telefonie łamią się w kolumny; na laptopie w jednym rzędzie z przewijaniem poziomym */
        .hoursRow {
          display: flex;
          flex-wrap: wrap; /* mobile: kolejne wiersze */
          gap: 12px;
          padding: 12px;
        }
        .hourCell {
          padding: 0;
          border: none;
          flex: 1 1 280px; /* min szerokość kafelka z mszą */
        }
        @media (min-width: 900px) {
          .hoursRow {
            flex-wrap: nowrap; /* laptop: wszystkie godziny w jednym rzędzie */
            overflow-x: auto; /* przewijanie w poziomie jeśli się nie mieszczą */
            -webkit-overflow-scrolling: touch;
          }
          .hourCell {
            flex: 0 0 340px; /* stała szerokość kafelka dla czytelności */
          }
        }

        .massCard {
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden; /* klipuje zawartość do zaokrąglonych rogów */
          background: #fff;
        }
        .massTable {
          width: 100%;
          border-collapse: separate; /* zachowaj oddzielne obramowania wierszy */
          border-spacing: 0;
          border: 0; /* brak zewnętrznego borderu na <table> */
        }
        .massHeader th {
          padding: 0;
          border-bottom: 1px solid var(--border);
        }
        .massHeaderRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 12px;
        }
        .timeWrap {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }
        .time {
          font-weight: 700;
          font-size: 1.05rem;
        }
        .type {
          color: var(--muted);
          font-size: 0.9rem;
        }

        .joinMenu {
          position: relative;
        }
        .joinBtn {
          list-style: none;
          border: 1px solid var(--border);
          background: #fff;
          border-radius: 999px;
          padding: 6px 10px;
          cursor: pointer;
          user-select: none;
          font-size: 0.9rem;
        }
        .joinBtn::-webkit-details-marker {
          display: none;
        }
        .joinMenu[open] .joinBtn {
          background: #fafafa;
        }
        .menu {
          position: absolute;
          top: 0;
          right: 0;
          margin-top: 8px;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          padding: 8px;
          min-width: 220px;
          z-index: 3;
        }
        .menuLabel {
          font-size: 0.8rem;
          color: var(--muted);
          padding: 6px 8px 8px;
        }
        .menuItem {
          width: 100%;
          text-align: left;
          border: 1px solid transparent;
          background: #fff;
          border-radius: 8px;
          padding: 8px 10px;
          margin: 2px 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .menuItem:hover {
          background: #f6f7f8;
          border-color: var(--border);
        }
        .menuItem:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .count {
          font-size: 0.8rem;
          color: var(--muted);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 0 8px;
        }

        .colHead {
          text-align: left;
          padding: 8px 10px;
          font-size: 0.85rem;
          color: var(--muted);
          border-bottom: 1px solid var(--border);
          background: #fafafa;
        }

        .fnCell,
        .peopleCell {
          padding: 8px 10px;
          border-bottom: 1px solid var(--border);
          vertical-align: top;
        }
        .massTable tbody tr:last-child .fnCell,
        .massTable tbody tr:last-child .peopleCell {
          border-bottom: none;
        }

        /* Kolorowanie wierszy zależnie od zapisów */
        .hasPeople .fnCell,
        .hasPeople .peopleCell {
          background: var(--green-verylight);
        }
        .noPeople .fnCell,
        .noPeople .peopleCell {
          background: var(--red-verylight);
        }

        /* Delikatne tło nagłówka Mszy zależnie od obsady */
        .massCard.hasAny .massHeader th {
          background: #f7fbf7;
        }
        .massCard.noAny .massHeader th {
          background: #fff6f6;
        }

        .peopleList {
          display: inline-block;
        }
        .you {
          color: #1a73e8;
          font-style: normal;
          font-weight: 600;
        }
        .empty {
          color: var(--muted);
          font-style: italic;
        }

        /* Dni minione – wyszarzone */
        .past {
          --border: var(--past-border);
          color: var(--past-fg);
          background: var(--past-bg);
        }
        .past .dayTable caption {
          background: #f7f8f9;
        }
        .past .massTable,
        .past .colHead,
        .past .fnCell,
        .past .peopleCell {
          border-color: var(--past-border);
        }
        .past .hasPeople .fnCell,
        .past .hasPeople .peopleCell {
          background: #edf1ed;
        }
        .past .noPeople .fnCell,
        .past .noPeople .peopleCell {
          background: #f1f1f1;
        }
        .past .joinBtn,
        .past .menuItem {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </main>
  );
}
