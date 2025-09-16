import dotenv from "dotenv";
import pgPromise from "pg-promise";

dotenv.config();

const db = pgPromise({})(process.env.URL);

export default db;
