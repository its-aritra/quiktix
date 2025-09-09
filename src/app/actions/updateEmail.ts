// src/actions/updateEmail.ts
"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function updateEmail(newEmail: string) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase.auth.updateUser({ email: newEmail })
  if (error) {
    console.error("Email update failed at auth:", error.message)
    throw new Error(error.message)
  }

  return data.user
}
