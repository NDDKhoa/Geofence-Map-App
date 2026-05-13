const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = "mongodb+srv://dai2272005nv_db_user:0oYm0PLvXdCcNXHV@cluster0.ztr2ufd.mongodb.net/vngo_travel";
const NEW_PASSWORD = "123456";

async function main() {
    console.log("==========================================");
    console.log("🔑 Đổi password tất cả users -> 123456");
    console.log("==========================================\n");

    const NEW_HASH = bcrypt.hashSync(NEW_PASSWORD, 12);
    console.log("Hash mới: " + NEW_HASH);
    console.log("");

    const client = new MongoClient(uri);
    await client.connect();
    console.log("✅ Kết nối MongoDB Atlas thành công!\n");

    const db = client.db("vngo_travel");
    const col = db.collection("users");

    // Cập nhật tất cả users
    const result = await col.updateMany({}, { $set: { password: NEW_HASH } });
    console.log("✅ Đã cập nhật " + result.modifiedCount + " users\n");

    // Liệt kê kết quả
    const users = await col.find({}, { projection: { email: 1, role: 1, fullName: 1, _id: 0 } }).toArray();
    console.log("=== DANH SÁCH USERS ===");
    users.forEach(u => {
        console.log("  📧 " + (u.email || '').padEnd(28) + "| role: " + (u.role || '').padEnd(8) + "| " + (u.fullName || ''));
    });

    // Verify hash
    const ok = bcrypt.compareSync("123456", NEW_HASH);
    console.log("\n🔐 Verify hash 123456: " + (ok ? "✅ KHỚP - Login được" : "❌ LỖI"));
    console.log("\n==========================================");
    console.log("✅ XONG! Tất cả login bằng password: 123456");
    console.log("==========================================");

    await client.close();
}

main().catch(console.error);
