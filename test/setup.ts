import { execSync } from "child_process";
import * as dotenv from "dotenv";

module.exports = async () => {
  dotenv.config({ path: ".env.test" });
  console.log("Environment variables loaded from .env.test");

  // Execute migrations to ensure the test database is up-to-date
  execSync("npx prisma migrate deploy");
  console.log("Migrations applied");
};
