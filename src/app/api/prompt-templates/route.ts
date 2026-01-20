import { NextResponse } from "next/server";

import { getMyProfile } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ templates: [] }, { status: 401 });
  }

  const profile = await getMyProfile();
  if (!profile) return NextResponse.json({ templates: [] }, { status: 401 });

  const { data, error } = await supabase
    .from("prompt_templates")
    .select("id,name,model,is_default")
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: "加载模型列表失败" }, { status: 500 });
  }

  return NextResponse.json({ templates: data ?? [] });
}
