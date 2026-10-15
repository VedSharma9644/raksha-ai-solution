import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const rootEnv = resolve(process.cwd(), "../../../.env");
config({ path: existsSync(rootEnv) ? rootEnv : resolve(process.cwd(), ".env") });

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
  console.error("Missing Firebase Admin env (PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY).");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

const db = getFirestore();

type Installment = {
  id?: string;
  year?: number;
  month?: number;
  amount?: number;
  status?: string;
  payrollRunId?: string | null;
};

type Repayment = {
  id?: string;
  date?: string;
  amount?: number;
  method?: string;
  payrollRunId?: string | null;
};

function summarizeAdvance(id: string, d: Record<string, unknown>) {
  const installments = (Array.isArray(d.installments) ? d.installments : []) as Installment[];
  const repayments = (Array.isArray(d.repayments) ? d.repayments : []) as Repayment[];
  return {
    id,
    agencyId: d.agencyId,
    guardId: d.guardId,
    guardName: d.guardName,
    amount: d.amount,
    givenOn: d.givenOn,
    purpose: d.purpose || "",
    recoveryMode: d.recoveryMode,
    emiMonths: d.emiMonths,
    recoveryStartYear: d.recoveryStartYear ?? null,
    recoveryStartMonth: d.recoveryStartMonth ?? null,
    installmentAmount: d.installmentAmount,
    outstanding: d.outstanding,
    recoveredTotal: d.recoveredTotal,
    status: d.status,
    installments: installments.map((i) => ({
      id: i.id,
      year: i.year,
      month: i.month,
      amount: i.amount,
      status: i.status,
      payrollRunId: i.payrollRunId ?? null,
    })),
    repayments: repayments.map((r) => ({
      id: r.id,
      date: r.date,
      amount: r.amount,
      method: r.method,
      payrollRunId: r.payrollRunId ?? null,
    })),
  };
}

async function main() {
  console.log("Project:", process.env.FIREBASE_PROJECT_ID);

  const advancesSnap = await db.collection("employeeAdvances").limit(50).get();
  console.log("\n=== employeeAdvances (up to 50) ===");
  console.log("count:", advancesSnap.size);
  const advances = advancesSnap.docs.map((doc) =>
    summarizeAdvance(doc.id, doc.data() as Record<string, unknown>)
  );
  console.log(JSON.stringify(advances, null, 2));

  const runsSnap = await db.collection("payrollRuns").limit(20).get();
  console.log("\n=== payrollRuns (up to 20) ===");
  console.log("count:", runsSnap.size);

  const runs = [];
  for (const doc of runsSnap.docs) {
    const d = doc.data() as Record<string, unknown>;
    const linesSnap = await doc.ref.collection("lines").limit(40).get();
    const lines = linesSnap.docs.map((l) => {
      const x = l.data() as Record<string, unknown>;
      return {
        id: l.id,
        guardName: x.guardName,
        employeeCode: x.employeeCode,
        monthlySalary: x.monthlySalary,
        grossPay: x.grossPay,
        advanceDeductionTotal: x.advanceDeductionTotal ?? 0,
        netPay: x.netPay ?? null,
        reliefBonusTotal: x.reliefBonusTotal ?? 0,
        status: x.status,
      };
    });
    runs.push({
      id: doc.id,
      agencyId: d.agencyId,
      status: d.status,
      period: d.period,
      guardCount: d.guardCount,
      totalGross: d.totalGross,
      linesSampleCount: lines.length,
      linesWithAdvanceCut: lines.filter(
        (l) => Number(l.advanceDeductionTotal ?? 0) > 0
      ),
      lines,
    });
  }
  console.log(JSON.stringify(runs, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
