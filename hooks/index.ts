/**
 * Hooks barrel export
 */

export {
  useENSTextRecord,
  useENSOwner,
  useENSRegistration,
  useSubdomainAvailability,
  getNamehash,
} from "./useENS";

export {
  useProjectNameAvailable,
  useProject,
  useRegisterProject,
  getProjectRegistryAddress,
  isContractDeployed,
} from "./useProjectRegistry";

