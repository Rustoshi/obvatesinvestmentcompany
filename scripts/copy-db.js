const { MongoClient } = require("mongodb");

const URI = "mongodb+srv://root:%40Newpass12@cluster0.sznor6a.mongodb.net";
const SOURCE_DB = "newmuskspace";
const TARGET_DB = "muskspaceinvestmentnew";

// Collections to skip
const SKIP = new Set(["users", "orders"]);

async function copyDatabase() {
    const client = new MongoClient(URI);

    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas\n");

        const sourceDb = client.db(SOURCE_DB);
        const targetDb = client.db(TARGET_DB);

        // List all collections in source
        const collections = await sourceDb.listCollections().toArray();
        console.log(`Found ${collections.length} collections in "${SOURCE_DB}":`);
        collections.forEach((c) =>
            console.log(`  - ${c.name}${SKIP.has(c.name) ? " (SKIP)" : ""}`)
        );
        console.log();

        for (const collInfo of collections) {
            const name = collInfo.name;

            if (SKIP.has(name)) {
                console.log(`⏭  Skipping "${name}"`);
                continue;
            }

            const sourceColl = sourceDb.collection(name);
            const targetColl = targetDb.collection(name);

            const docs = await sourceColl.find({}).toArray();

            if (docs.length === 0) {
                console.log(`⚠  "${name}" — empty, skipping`);
                continue;
            }

            // Drop existing target collection to avoid duplicates
            try {
                await targetColl.drop();
            } catch (e) {
                // Collection doesn't exist yet — that's fine
            }

            const result = await targetColl.insertMany(docs);
            console.log(`✓  "${name}" — copied ${result.insertedCount} documents`);

            // Copy indexes (skip the default _id index)
            const indexes = await sourceColl.indexes();
            for (const idx of indexes) {
                if (idx.name === "_id_") continue;
                const { key, ...options } = idx;
                delete options.v; // remove version field
                try {
                    await targetColl.createIndex(key, options);
                    console.log(`   ↳ Index "${idx.name}" created`);
                } catch (e) {
                    console.log(`   ↳ Index "${idx.name}" skipped: ${e.message}`);
                }
            }
        }

        console.log(`\n✅ Done! All collections (except ${[...SKIP].join(", ")}) copied from "${SOURCE_DB}" → "${TARGET_DB}"`);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

copyDatabase();
