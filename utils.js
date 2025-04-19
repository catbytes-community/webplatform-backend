const repo = require('./repositories/roles_repository');
const { loadSecrets } = require("./aws/ssm-helper");
const config = require('config');
const logger = require('./logger')(__filename);

let rolesCache = null;

const ROLE_NAMES = {
  mentor: 'mentor',
  member: 'member'
};

async function getFirebaseSdkServiceAccount() {
  let serviceAccount = null;
  try {
    if (process.env.ENVIRONMENT === "local") {
      serviceAccount = require("./serviceAccountKey.json");
    }
    else {
      const awsConfig = config.aws;
      const credentials = await loadSecrets(awsConfig.param_store_region, ['/catbytes_webplatform/fb_serviceAccountKey'], true);
      const jsonFile = credentials['fb_serviceAccountKey'];
      serviceAccount = JSON.parse(jsonFile);
    }
  }
  catch (err) {
    logger.error(err, "Error getting service account");
    throw new Error("Failed to retrieve service account");
  }
  return serviceAccount;
}

async function loadRolesIntoMemory() {
  try {
    if (!rolesCache) {
      const roles = await repo.getAllRoles();
      rolesCache = roles.reduce((acc, role) => {
        acc[role.role_name] = role.id;
        if (!isRoleExists(role.role_name)) {
          logger.warn(`Role ${role.role_name} is in database, but is not in the ROLE_NAMES enum.`);
        }
        return acc;
      }, {});
      logger.debug(rolesCache, 'Roles loaded into memory');
    }
  } catch (err) {
    logger.error(err, "Error loading roles");
    throw new Error("Failed to initialize roles");
  }
}

function getRole(roleName) {
  if (!rolesCache) {
    throw new Error("Roles are not loaded");
  }
  return rolesCache[roleName];
}

function isRoleExists(role) {
  return Object.values(ROLE_NAMES).includes(role);
}

const APPL_STATUSES = {
  approved: "approved",
  rejected: "rejected",
  pending: "pending",
};

module.exports = { APPL_STATUSES, ROLE_NAMES, isRoleExists, loadRolesIntoMemory, getRole, getFirebaseSdkServiceAccount };
