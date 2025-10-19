declare module "mysqldump" {
  interface MySqlDumpConnection {
    host: string;
    user: string;
    password: string;
    database: string;
    port?: number;
  }

  interface MySqlDumpOptions {
    connection: MySqlDumpConnection;
    dumpToFile?: string;
  }

  export default function mysqldump(options: MySqlDumpOptions): Promise<void>;
}
