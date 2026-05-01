import "server-only";
import type { NextAuthConfig } from "next-auth";

const authConfig: NextAuthConfig = {
  providers: [], // ❗ kosong di edge
};

export default authConfig;
