export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: "expo",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
