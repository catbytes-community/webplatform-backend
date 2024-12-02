let rolesCache = null;

async function loadRolesIntoMemory(pool) {
  try {
    if (!rolesCache) {
      const roles = await pool.query("SELECT * FROM roles");
      rolesCache = roles.rows.reduce((acc, role) => {
        acc[role.role_name] = role.id;
        if (!isRoleExists(role.role_name)) {
          console.warn(
            `Role ${role.role_name} is in database, but is not in the ROLE_NAMES enum.`
          );
        }
        return acc;
      }, {});

      console.log("Roles loaded into memory:", rolesCache);
    }
  } catch (error) {
    console.error("Error loading roles:", error);
    throw new Error("Failed to initialize roles");
  }
}

function getRole(role_name) {
  if (!rolesCache) {
    throw new Error("Roles are not loaded");
  }
  return rolesCache[role_name];
}

const ROLE_NAMES = {
  mentor: "mentor",
  member: "member",
};

function isRoleExists(role) {
  return Object.values(ROLE_NAMES).includes(role);
}

const STATUS_NAMES = {
  approved: "approved",
  rejected: "rejected",
};

module.exports = { loadRolesIntoMemory, getRole, ROLE_NAMES, STATUS_NAMES };
