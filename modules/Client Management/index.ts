export type {
  ProspectClient,
  ProspectNote,
  ProspectStatus,
  LeadSource,
} from "./prospectClient";
export {
  PROSPECT_CLIENTS_COLLECTION,
  PROSPECT_NOTES_SUBCOLLECTION,
} from "./prospectClient";

export type {
  AddProspectParams,
  UpdateProspectParams,
} from "./prospectService";
export {
  addProspect,
  getProspectById,
  listProspectsByAgency,
  updateProspect,
  deleteProspect,
  addProspectNote,
  listProspectNotes,
  deleteProspectNote,
} from "./prospectService";
