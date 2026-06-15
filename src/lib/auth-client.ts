"use client";

import { createAuthClient } from "better-auth/react";

// In the browser the client defaults to window.location.origin, which is
// exactly what we want in dev and in production.
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
