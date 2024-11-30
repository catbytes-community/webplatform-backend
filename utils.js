


const ROLE_NAMES = {
    mentor: 'mentor',
    member: 'member'
}

function isRoleExists(role) {
    return Object.values(ROLE_NAMES).includes(role);
}

module.exports = { isRoleExists, ROLE_NAMES };