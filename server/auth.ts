import { betterAuth } from "better-auth";
import { PostgresJSDialect } from "kysely-postgres-js";
import postgres from "postgres";

const dialect = new PostgresJSDialect({
    postgres: postgres(),
});

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: ["http://localhost:5173"],
    database: {
        dialect: dialect,
        type: "postgres",
    },
    emailAndPassword: {
        enabled: true,
    },
    user: {
        modelName: "app_user",
        deleteUser: {
            enabled: true,
        },
    },
});
