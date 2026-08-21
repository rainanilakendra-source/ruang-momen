"use server";

import { redirect } from "next/navigation";
import { deleteCurrentSession } from "../lib/auth";

export async function logoutUser(): Promise<void> {
  await deleteCurrentSession();
  redirect("/masuk");
}
