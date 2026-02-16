"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentMethods = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const users_1 = require("./users");
exports.paymentMethods = (0, mysql_core_1.mysqlTable)("payment_methods", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 100 }).unique(),
    status: users_1.ActivityStatus.default("active"),
});
