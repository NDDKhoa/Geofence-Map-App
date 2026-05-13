const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = "mongodb+srv://dai2272005nv_db_user:0oYm0PLvXdCcNXHV@cluster0.ztr2ufd.mongodb.net/vngo_travel";
const fs = require('fs');
const path = require('path');

async function main() {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("vngo_travel");
    const users = await db.collection("users").find({}).toArray();

    // Chuyển sang EJSON format để lưu file
    const ejsonUsers = users.map(u => ({
        "_id": { "$oid": u._id.toString() },
        "email": u.email,
        "fullName": u.fullName,
        "password": u.password,
        "role": u.role,
        "isPremium": u.isPremium,
        "isActive": u.isActive,
        "qrScanCount": u.qrScanCount,
        "createdAt": u.createdAt ? { "$date": u.createdAt.toISOString() } : { "$date": "2026-04-15T20:00:00.000Z" },
        "updatedAt": u.updatedAt ? { "$date": u.updatedAt.toISOString() } : { "$date": "2026-04-15T20:00:00.000Z" },
        "__v": u.__v || 0
    }));

    const filePath = path.join(__dirname, 'vngo_travel.users.json');
    fs.writeFileSync(filePath, JSON.stringify(ejsonUsers, null, 2), 'utf8');
    console.log("✅ Đã cập nhật file vngo_travel.users.json với hash mới (123456)");
    await client.close();
}
main().catch(console.error);
