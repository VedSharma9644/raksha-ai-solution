import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { SiteEarningsDetail } from "@raskha/earnings";
import { APP_ROUTES } from "../../../app/routePaths";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import { fetchSiteEarningsDetailApi } from "../earningsApi";
import "./EarningsSiteDetailScreen.css";

function formatMoney(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function EarningsSiteDetailScreen() {
  const { siteId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const now = new Date();
  const year = Number(searchParams.get("year") ?? now.getFullYear());
  const month = Number(searchParams.get("month") ?? now.getMonth() + 1);

  const [detail, setDetail] = useState<SiteEarningsDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!siteId) return;
    let cancelled = false;
    setIsLoading(true);
    setError("");
    fetchSiteEarningsDetailApi({
      siteId,
      fromYear: year,
      fromMonth: month,
      toYear: year,
      toMonth: month,
    })
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const e = err as { message?: string };
          setError(e.message ?? "Failed to load site earnings.");
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [siteId, year, month]);

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content earnings-detail">
        <PageHeader
          title={detail?.site.siteName ?? "Site earnings"}
          subtitle={
            detail
              ? `${detail.from.year}-${String(detail.from.month).padStart(2, "0")} · ${detail.site.clientName || "Client"}`
              : "Loading…"
          }
          onBack={() => navigate(APP_ROUTES.earnings)}
          backLabel="Back to earnings"
        />

        {error ? (
          <p className="earnings-detail__error" role="alert">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <p className="earnings-detail__hint">Loading…</p>
        ) : detail ? (
          <>
            <p className="earnings-detail__note">{detail.note}</p>

            <div className="earnings-detail__totals">
              <div>
                <span>Money in</span>
                <strong>{formatMoney(detail.site.moneyIn)}</strong>
              </div>
              <div>
                <span>Money out</span>
                <strong>{formatMoney(detail.site.moneyOut)}</strong>
              </div>
              <div
                className={`earnings-detail__net earnings-detail__net--${detail.site.result}`}
              >
                <span>Net</span>
                <strong>{formatMoney(detail.site.net)}</strong>
                <em>
                  {detail.site.result === "profit"
                    ? "Profit"
                    : detail.site.result === "loss"
                      ? "Loss"
                      : "Break-even"}
                </em>
              </div>
            </div>

            <section className="earnings-detail__section">
              <h2 className="earnings-detail__section-title">Guard pay</h2>
              {detail.guards.length === 0 ? (
                <p className="earnings-detail__hint">
                  No guards assigned to this site.
                </p>
              ) : (
                <ul className="earnings-detail__list">
                  {detail.guards.map((g) => (
                    <li key={g.guardId}>
                      <div>
                        <strong>{g.guardName}</strong>
                        <span>
                          {g.employeeCode || "—"} · {g.gender} · {g.source}
                        </span>
                      </div>
                      <strong>{formatMoney(g.amount)}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="earnings-detail__section">
              <h2 className="earnings-detail__section-title">
                Relief bonuses at this site
              </h2>
              {detail.relief.length === 0 ? (
                <p className="earnings-detail__hint">
                  No relief bonuses attributed to this site in the period.
                </p>
              ) : (
                <ul className="earnings-detail__list">
                  {detail.relief.map((r) => (
                    <li key={`${r.reliefRequestId}-${r.dutyDate}`}>
                      <div>
                        <strong>{r.dutyDate}</strong>
                        <span>
                          {r.assigneeName || "Assignee"} · {r.note || "—"}
                        </span>
                      </div>
                      <strong>{formatMoney(r.amount)}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="earnings-detail__section">
              <h2 className="earnings-detail__section-title">
                Expenses at this site
              </h2>
              {(detail.expenses?.length ?? 0) === 0 ? (
                <p className="earnings-detail__hint">
                  No expenses attributed to this site in the period.
                </p>
              ) : (
                <ul className="earnings-detail__list">
                  {(detail.expenses ?? []).map((e) => (
                    <li key={e.expenseId}>
                      <div>
                        <strong>{e.date}</strong>
                        <span>
                          {e.category}
                          {e.guardName ? ` · ${e.guardName}` : ""}
                          {e.note ? ` · ${e.note}` : ""}
                        </span>
                      </div>
                      <strong>{formatMoney(e.amount)}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : null}
      </div>
    </AppScreenLayout>
  );
}
