import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET() {
  // Replace "events" with your actual table name
  const { data, error } = await supabase.from("events").select("*").limit(5)

  if (error) {
    return NextResponse.json({ success: false, error: error.message })
  }

  return NextResponse.json({ success: true, data })
}
