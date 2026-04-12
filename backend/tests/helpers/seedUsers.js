const User = require('../../src/models/user.model');
const { ROLES } = require('../../src/constants/roles');

async function seedUsers() {
    await User.create([
        { email: 'admin@test.local', password: 'password123', role: ROLES.ADMIN, isPremium: false },
        { email: 'owner@test.local', password: 'password123', role: ROLES.OWNER, isPremium: false },
        { email: 'user@test.local', password: 'password123', role: ROLES.USER, isPremium: false }
    ]);
}

module.exports = { seedUsers };
