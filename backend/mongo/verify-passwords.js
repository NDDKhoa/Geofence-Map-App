const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = "mongodb+srv://dai2272005nv_db_user:0oYm0PLvXdCcNXHV@cluster0.ztr2ufd.mongodb.net/vngo_travel";

async function main() {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("vngo_travel");
    const users = await db.collection("users").find({}).toArray();

    console.log("=== KIỂM TRA LOGIN PASSWORD 123456 ===\n");
    let allOk = true;
    for (const u of users) {
        const ok = bcrypt.compareSync("123456", u.password);
        const icon = ok ? "✅" : "❌";
        console.log(icon + " " + (u.email || "").padEnd(28) + "| " + (u.role || "").padEnd(8) + "| " + (u.fullName || ""));
        if (!ok) allOk = false;
    }

    console.log("\n" + (allOk ? "✅ TẤT CẢ LOGIN ĐƯỢC với 123456" : "❌ CÓ USER KHÔNG KHỚP - cần fix lại"));

    // Test sai password
    const wrongOk = bcrypt.compareSync("654321", users[0].password);
    console.log("🔐 Test sai password '654321': " + (wrongOk ? "❌ BUG - khớp nhầm!" : "✅ Không khớp (đúng)"));

    await client.close();
}
main().catch(console.error);
