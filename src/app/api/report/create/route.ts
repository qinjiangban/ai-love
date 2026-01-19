import { NextResponse } from "next/server";
import { z } from "zod";

import { generateCoupleReport } from "@/lib/ai/generate-couple-report";
import { getMyProfile } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { coupleInputSchema } from "@/lib/validation";

const bodySchema = z.object({
  input: coupleInputSchema,
  template_id: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "输入不合法，请检查出生日期与时间格式" },
      { status: 400 },
    );
  }

  const supabase = await getSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const profile = await getMyProfile();
  if (!profile) {
    return NextResponse.json({ error: "登录状态异常" }, { status: 401 });
  }

  const created = await supabase
    .from("couple_reports")
    .insert({
      user_id: userData.user.id,
      status: "generating",
      input: parsed.data.input,
    })
    .select("id")
    .single();

  if (created.error) {
    return NextResponse.json({ error: "创建报告失败" }, { status: 500 });
  }

  const template = parsed.data.template_id
    ? (
        await supabase
          .from("prompt_templates")
          .select("id,model,system_prompt,user_prompt_template")
          .eq("id", parsed.data.template_id)
          .maybeSingle()
      ).data
    : (
        await supabase
          .from("prompt_templates")
          .select("id,model,system_prompt,user_prompt_template")
          .eq("is_default", true)
          .maybeSingle()
      ).data;

  if (!template) {
    await supabase
      .from("couple_reports")
      .update({ status: "failed", error_message: "未配置默认模板" })
      .eq("id", created.data.id);
    return NextResponse.json({ id: created.data.id });
  }

  try {
    const result = await generateCoupleReport({
      input: parsed.data.input,
      template,
    });

    const total7 = result.actionPlan.days7.reduce(
      (acc, d) => acc + d.tasks.length,
      0,
    );
    const total30 = result.actionPlan.days30.reduce(
      (acc, w) => acc + w.goals.length,
      0,
    );
    const action_plan_state = {
      days7: new Array(total7).fill(false),
      days30: new Array(total30).fill(false),
    };

    await supabase
      .from("couple_reports")
      .update({
        status: "succeeded",
        result,
        model: template.model,
        template_id: template.id,
        action_plan_state,
        error_message: null,
      })
      .eq("id", created.data.id);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "生成失败";
    await supabase
      .from("couple_reports")
      .update({
        status: "failed",
        model: template.model,
        template_id: template.id,
        error_message: message.slice(0, 240),
      })
      .eq("id", created.data.id);
  }

  return NextResponse.json({ id: created.data.id });
}
