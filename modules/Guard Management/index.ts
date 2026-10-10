export {
  GUARDS_COLLECTION,
  type Guard,
  type GuardStatus,
  type GuardGender,
} from "./guard";

export {
  addGuard,
  getGuardById,
  listGuardsByAgency,
  updateGuard,
  deleteGuard,
  bulkUpdateGuardSiteAssignment,
  type AddGuardParams,
  type UpdateGuardParams,
} from "./guardService";

export {
  createGuardAccount,
  type CreateGuardAccountParams,
} from "./guardAuth";

export {
  PROSPECT_GUARDS_COLLECTION,
  PROSPECT_GUARD_NOTES_SUBCOLLECTION,
  type ProspectGuard,
  type ProspectGuardNote,
  type ProspectGuardStatus,
  type ApplicationSource,
} from "./prospectGuard";

export {
  addProspectGuard,
  getProspectGuardById,
  listProspectGuardsByAgency,
  updateProspectGuard,
  deleteProspectGuard,
  addProspectGuardNote,
  listProspectGuardNotes,
  deleteProspectGuardNote,
  type AddProspectGuardParams,
  type UpdateProspectGuardParams,
} from "./prospectGuardService";

