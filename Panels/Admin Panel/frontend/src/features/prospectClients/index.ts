// ── Types & form helpers ──────────────────────────────────────────────────────
export type { ProspectFormValues, SelectOption } from "./prospectFormTypes";
export {
  EMPTY_PROSPECT_FORM,
  PROSPECT_STATUS_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  EXPECTED_SITE_TYPE_OPTIONS,
  statusLabel,
  statusColorClass,
} from "./prospectFormTypes";

// ── Hooks ─────────────────────────────────────────────────────────────────────
export { useProspectList } from "./useProspectList";
export { useSaveProspect } from "./useSaveProspect";
export { useProspectNotes } from "./useProspectNotes";

// ── Screens ───────────────────────────────────────────────────────────────────
export { ProspectListScreen } from "./ProspectListScreen/ProspectListScreen";
export type { ProspectListScreenProps } from "./ProspectListScreen/ProspectListScreen";

export { ProspectDetailScreen } from "./ProspectDetailScreen/ProspectDetailScreen";
export type { ProspectDetailScreenProps } from "./ProspectDetailScreen/ProspectDetailScreen";

// ── Modals ────────────────────────────────────────────────────────────────────
export { AddProspectModal } from "./AddProspectModal/AddProspectModal";
export type { AddProspectModalProps } from "./AddProspectModal/AddProspectModal";
