/**
 * Hooks barrel export
 */

export {
  useENSTextRecord,
  useSetENSTextRecord,
  useENSRegistration,
  useENSAvailability,
  getNamehash,
} from "./useENS";

export {
  useProjectNameAvailable,
  useProject,
  useRegisterProject,
  getProjectRegistryAddress,
  isContractDeployed,
} from "./useProjectRegistry";

