import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ templates: [] }, { status: 401 });
  }

  const profileRes = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userData.user.id)
    .maybeSingle();
  if (profileRes.error || !profileRes.data) {
    return NextResponse.json({ templates: [] }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("prompt_templates")
    .select("id,name,model,is_default")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "加载模型列表失败" }, { status: 500 });
  }

  return NextResponse.json({ templates: data ?? [] });
}
