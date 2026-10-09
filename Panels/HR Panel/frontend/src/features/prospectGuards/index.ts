// List screen
export { ProspectGuardListScreen } from "./ProspectGuardListScreen/ProspectGuardListScreen";
export type { ProspectGuardListScreenProps } from "./ProspectGuardListScreen/ProspectGuardListScreen";

// Detail screen
export { ProspectGuardDetailScreen } from "./ProspectGuardDetailScreen/ProspectGuardDetailScreen";
export type { ProspectGuardDetailScreenProps } from "./ProspectGuardDetailScreen/ProspectGuardDetailScreen";

// Add / Edit modal
export { AddProspectGuardModal } from "./AddProspectGuardModal/AddProspectGuardModal";
export type { AddProspectGuardModalProps } from "./AddProspectGuardModal/AddProspectGuardModal";

// Hooks
export { useProspectGuardList } from "./useProspectGuardList";
export type { ProspectGuardListItem } from "./useProspectGuardList";

export { useSaveProspectGuard } from "./useSaveProspectGuard";

export { useProspectGuardNotes } from "./useProspectGuardNotes";
export type { ProspectGuardNote } from "./useProspectGuardNotes";

// Form types & helpers
export {
  EMPTY_PROSPECT_GUARD_FORM,
  PROSPECT_GUARD_STATUS_OPTIONS,
  APPLICATION_SOURCE_OPTIONS,
  GENDER_OPTIONS,
  PHYSICAL_FITNESS_OPTIONS,
  guardStatusLabel,
  guardStatusColorClass,
} from "./prospectGuardFormTypes";
export type { ProspectGuardFormValues, SelectOption } from "./prospectGuardFormTypes";
