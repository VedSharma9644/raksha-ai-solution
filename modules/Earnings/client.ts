/**
 * Browser-safe earnings exports (no firebase-admin).
 */
export {
  marginResult,
  roundMoney,
  listMonthsInclusive,
  resolveReportRange,
  earningsSummaryToCsv,
  type EarningsReportPeriod,
  type YearMonth,
  type SiteEarningsGuardCost,
  type SiteEarningsReliefCost,
  type SiteEarningsExpenseCost,
  type SiteEarningsRow,
  type EarningsSummary,
  type SiteEarningsDetail,
} from "./earningsTypes";
