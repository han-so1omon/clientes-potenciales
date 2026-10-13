import postgres from "postgres";
import { E2E_DATABASE_URL } from "../playwright.config";

export const sql = postgres(E2E_DATABASE_URL, { max: 1 });
