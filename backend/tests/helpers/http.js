const request = require('supertest');

function app() {
    if (!global.__APP__) {
        throw new Error('App not ready — ensure setupAfterEnv beforeAll ran');
    }
    return global.__APP__;
}

function agent() {
    return request(app());
}

async function login(email, password) {
    const res = await agent()
        .post('/api/v1/auth/login')
        .send({ email, password })
        .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    return res.body.data.token;
}

module.exports = { app, agent, login };
