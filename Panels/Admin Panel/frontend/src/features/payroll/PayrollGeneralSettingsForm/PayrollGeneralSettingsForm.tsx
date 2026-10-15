import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { PayrollGeneralSettings } from "@raskha/payroll";
import { Button } from "../../../components/Button";
import { FormPanel } from "../../../components/FormPanel";
import { SelectField } from "../../../components/SelectField";
import { TextField } from "../../../components/TextField";
import "./PayrollGeneralSettingsForm.css";

export interface PayrollGeneralSettingsFormProps {
  initialSettings: PayrollGeneralSettings;
  isSubmitting: boolean;
  readOnly?: boolean;
  serverWarnings?: string[];
  onCancel: () => void;
  onSubmit?: (settings: PayrollGeneralSettings) => void | Promise<void>;
}

export function PayrollGeneralSettingsForm({
  initialSettings,
  isSubmitting,
  readOnly = false,
  serverWarnings = [],
  onCancel,
  onSubmit,
}: PayrollGeneralSettingsFormProps) {
  const [values, setValues] = useState(initialSettings);

  useEffect(() => {
    setValues(initialSettings);
  }, [initialSettings]);

  function patch<K extends keyof PayrollGeneralSettings>(
    key: K,
    value: PayrollGeneralSettings[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (readOnly || !onSubmit) return;
    await onSubmit({ ...values, weeklyOffDays: [] });
  }

  const disabled = readOnly || isSubmitting;

  return (
    <form className="payroll-settings-form" onSubmit={(e) => void handleSubmit(e)} noValidate>
      <FormPanel className="form-panel--wide">
        <div className="form-panel__grid">
          {readOnly ? (
            <p className="payroll-settings-form__notice" role="status">
              Only the agency admin can change these settings. You can view them
              here.
            </p>
          ) : null}

          {serverWarnings[0] ? (
            <p className="payroll-settings-form__warning" role="status">
              {serverWarnings[0]}
            </p>
          ) : null}

          <p className="payroll-settings-form__section-label">Work week</p>
          <p className="payroll-settings-form__hint">
            Set how many weekly offs each employee gets. Which day is off is
            different for each guard and is set on the guard (or roster) — not
            the same day for everyone.
          </p>
          <TextField
            label="How many weekly offs does each employee get?"
            name="weeklyOffCount"
            type="number"
            min={0}
            max={7}
            value={String(values.weeklyOffCount)}
            onChange={(e) =>
              patch("weeklyOffCount", Number(e.target.value) || 0)
            }
            hint="Example: 1 or 2. Each guard’s actual off day can be different."
            required
            disabled={disabled}
          />

          <p className="payroll-settings-form__section-label">Paid leave each year</p>
          <TextField
            label="How many casual leave days does each employee get in a year?"
            name="casualLeavePerYear"
            type="number"
            min={0}
            max={366}
            value={String(values.casualLeavePerYear)}
            onChange={(e) =>
              patch("casualLeavePerYear", Number(e.target.value) || 0)
            }
            required
            disabled={disabled}
          />
          <TextField
            label="How many medical / sick leave days each year?"
            name="medicalLeavePerYear"
            type="number"
            min={0}
            max={366}
            value={String(values.medicalLeavePerYear)}
            onChange={(e) =>
              patch("medicalLeavePerYear", Number(e.target.value) || 0)
            }
            required
            disabled={disabled}
          />
          <SelectField
            label="Do unused leaves carry to next year?"
            name="leaveCarryForward"
            value={values.leaveCarryForward ? "yes" : "no"}
            onChange={(e) =>
              patch("leaveCarryForward", e.target.value === "yes")
            }
            options={[
              { value: "no", label: "No" },
              { value: "yes", label: "Yes" },
            ]}
            disabled={disabled}
          />
          {values.leaveCarryForward ? (
            <TextField
              label="If yes, what is the maximum days that can carry over?"
              name="leaveCarryForwardMaxDays"
              type="number"
              min={0}
              max={366}
              value={String(values.leaveCarryForwardMaxDays)}
              onChange={(e) =>
                patch("leaveCarryForwardMaxDays", Number(e.target.value) || 0)
              }
              disabled={disabled}
            />
          ) : null}

          <p className="payroll-settings-form__section-label">Day salary</p>
          <SelectField
            label="How should one day’s pay be calculated?"
            name="daySalaryMethod"
            value={values.daySalaryMethod}
            onChange={(e) =>
              patch(
                "daySalaryMethod",
                e.target.value as PayrollGeneralSettings["daySalaryMethod"]
              )
            }
            options={[
              {
                value: "calendar_month",
                label: "Calendar month — monthly salary ÷ days in that month",
              },
              {
                value: "working_days",
                label:
                  "Working days — monthly salary ÷ (days in month − weekly offs − paid leaves)",
              },
            ]}
            disabled={disabled}
          />

          <p className="payroll-settings-form__section-label">Half / part shift</p>
          <SelectField
            label="If someone works only half a day, how much pay is cut?"
            name="halfShiftDeduction"
            value={values.halfShiftDeduction}
            onChange={(e) =>
              patch(
                "halfShiftDeduction",
                e.target.value as PayrollGeneralSettings["halfShiftDeduction"]
              )
            }
            options={[
              {
                value: "half_day",
                label: "Half of one day’s salary (50%)",
              },
              { value: "full_day", label: "Full day cut" },
              {
                value: "custom_percent",
                label: "Custom % of day’s salary",
              },
            ]}
            disabled={disabled}
          />
          {values.halfShiftDeduction === "custom_percent" ? (
            <TextField
              label="Custom cut (% of day’s salary)"
              name="halfShiftCustomPercent"
              type="number"
              min={0}
              max={100}
              value={String(values.halfShiftCustomPercent)}
              onChange={(e) =>
                patch("halfShiftCustomPercent", Number(e.target.value) || 0)
              }
              disabled={disabled}
            />
          ) : null}

          <p className="payroll-settings-form__section-label">Pay cycle &amp; extras</p>
          <TextField
            label="Pay month starts on which date? (usually 1)"
            name="payCycleStartDay"
            type="number"
            min={1}
            max={28}
            value={String(values.payCycleStartDay)}
            onChange={(e) =>
              patch("payCycleStartDay", Number(e.target.value) || 1)
            }
            hint="Choose a day from 1 to 28"
            disabled={disabled}
          />
          <SelectField
            label="Is overtime paid?"
            name="overtimePaid"
            value={values.overtimePaid ? "yes" : "no"}
            onChange={(e) => patch("overtimePaid", e.target.value === "yes")}
            options={[
              { value: "no", label: "No" },
              { value: "yes", label: "Yes" },
            ]}
            disabled={disabled}
          />
          {values.overtimePaid ? (
            <TextField
              label="Overtime rate (× of normal day / hour rate)"
              name="overtimeMultiplier"
              type="number"
              min={1}
              max={5}
              step={0.1}
              value={String(values.overtimeMultiplier)}
              onChange={(e) =>
                patch("overtimeMultiplier", Number(e.target.value) || 1)
              }
              hint="Example: 1.5"
              disabled={disabled}
            />
          ) : null}
          <SelectField
            label="Deduct pay for late arrival or early leave?"
            name="deductLateEarly"
            value={values.deductLateEarly ? "yes" : "no"}
            onChange={(e) =>
              patch("deductLateEarly", e.target.value === "yes")
            }
            options={[
              { value: "no", label: "No" },
              { value: "yes", label: "Yes (detailed rules later)" },
            ]}
            disabled={disabled}
          />
          <SelectField
            label="Deduct PF / ESI from salary?"
            name="deductPfEsi"
            value={values.deductPfEsi ? "yes" : "no"}
            onChange={(e) => patch("deductPfEsi", e.target.value === "yes")}
            options={[
              { value: "no", label: "No" },
              { value: "yes", label: "Yes (formulas later)" },
            ]}
            disabled={disabled}
          />
          <SelectField
            label="Who is covered by these payroll rules?"
            name="coveredRoles"
            value={values.coveredRoles}
            onChange={(e) =>
              patch(
                "coveredRoles",
                e.target.value as PayrollGeneralSettings["coveredRoles"]
              )
            }
            options={[
              { value: "guards", label: "Guards only" },
              { value: "guards_and_hr", label: "Guards + HR staff" },
            ]}
            disabled={disabled}
          />

          <div className="form-panel__actions payroll-settings-form__actions">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {readOnly ? "Back" : "Cancel"}
            </Button>
            {!readOnly ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save settings"}
              </Button>
            ) : null}
          </div>
        </div>
      </FormPanel>
    </form>
  );
}
