import mongoose from "mongoose";

/**
 * Connect to MongoDB with Mongoose 8.
 * - No deprecated options (useNewUrlParser / useUnifiedTopology were removed in Mongoose 6+).
 * - Explicit timeouts so failures surface fast instead of hanging 30s.
 * - Categorized error logging so you can tell auth / DNS / timeout / paused-cluster apart.
 * - Never logs the connection string or password.
 */
const connectDB = async (): Promise<typeof mongoose> => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error(
      "MONGO_URI is not set. Check your .env file and that dotenv.config() runs before connectDB()."
    );
  }

  // Safe, non-secret log: host only, no user/password.
  try {
    const host = new URL(uri.replace("mongodb+srv://", "https://")).host;
    console.log(`[db] Connecting to MongoDB host: ${host}`);
  } catch {
    console.log("[db] Connecting to MongoDB (host could not be parsed)");
  }

  mongoose.connection.on("connected", () => {
    console.log("[db] Mongoose connected");
  });
  mongoose.connection.on("error", (err) => {
    console.error("[db] Mongoose runtime error:", err?.name, err?.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("[db] Mongoose disconnected");
  });

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      maxPoolSize: 10,
      retryWrites: true,
    });
    console.log(
      `[db] Connected. readyState=${mongoose.connection.readyState} db=${conn.connection.name}`
    );
    return conn;
  } catch (err: any) {
    const name = err?.name || "UnknownError";
    const code = err?.code || err?.codeName || "n/a";
    const msg = err?.message || String(err);

    let category = "UNKNOWN";
    if (name === "MongooseServerSelectionError") {
      if (/ENOTFOUND|EAI_AGAIN|querySrv/i.test(msg)) category = "DNS/SRV";
      else if (/ETIMEDOUT|ECONNREFUSED|ECONNRESET/i.test(msg))
        category = "NETWORK/TIMEOUT";
      else if (/Authentication failed|bad auth/i.test(msg))
        category = "AUTH";
      else category = "SERVER_SELECTION (often = paused cluster or IP not allow-listed)";
    } else if (name === "MongoParseError") {
      category = "BAD_URI_FORMAT";
    } else if (/Authentication failed|bad auth/i.test(msg)) {
      category = "AUTH";
    }

    console.error(
      `[db] ❌ Connection failed. category=${category} name=${name} code=${code}`
    );
    console.error(`[db] message: ${msg}`);
    throw err;
  }
};

export default connectDB;
