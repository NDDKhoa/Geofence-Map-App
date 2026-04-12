const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGO_URI = uri;
    await mongoose.connect(uri);
    // eslint-disable-next-line global-require
    global.__APP__ = require('../src/app');
}, 120000);

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase().catch(() => {});
        await mongoose.disconnect();
    }
    if (mongod) {
        await mongod.stop();
    }
    delete global.__APP__;
}, 60000);

afterEach(async () => {
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
        return;
    }
    const cols = await mongoose.connection.db.collections();
    for (const col of cols) {
        await col.deleteMany({});
    }
});
