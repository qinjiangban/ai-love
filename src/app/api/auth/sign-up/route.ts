import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "邮箱或密码格式不正确（密码至少 8 位）" },
      { status: 400 },
    );
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    const raw = typeof error.message === "string" ? error.message : "";
    const isConfirmationEmailSendError =
      /error\s+sending\s+confirmation\s+email/i.test(raw) ||
      (/confirm/i.test(raw) && /send/i.test(raw) && /email/i.test(raw));

    if (isConfirmationEmailSendError) {
      const serviceRoleConfigured =
        !!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
      if (!serviceRoleConfigured) {
        return NextResponse.json(
          {
            error: `注册需要发送确认邮件，但 Supabase 当前发送失败。你现在开启了“邮箱确认”或自定义 SMTP 未配置完整。
可选修复：
1) Supabase → 认证 → 电子邮件：关闭“启用自定义SMTP”（让 Supabase 默认邮件服务发送）；或把 SMTP 的端口/用户名/密码/TLS 配齐。
2) 如果你不想发任何确认邮件：Supabase → 认证 → 登录/注册（或 Email Provider 设置）里关闭“邮箱确认”。
3) 若你希望应用侧强制免邮件注册：在本项目 .env.local 配置 SUPABASE_SERVICE_ROLE_KEY。`,
          },
          { status: 500 },
        );
      }

      try {
        const admin = getSupabaseAdminClient();
        const created = await admin.auth.admin.createUser({
          email: parsed.data.email,
          password: parsed.data.password,
          email_confirm: true,
        });

        if (created.error) {
          const msg = created.error.message
            ? `注册失败：${created.error.message}`
            : "注册失败";
          return NextResponse.json(
            { error: msg },
            { status: created.error.status ?? 400 },
          );
        }

        const signIn = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (signIn.error) {
          const msg = signIn.error.message
            ? `登录失败：${signIn.error.message}`
            : "登录失败";
          return NextResponse.json(
            { error: msg },
            { status: signIn.error.status ?? 400 },
          );
        }

        return NextResponse.json({ ok: true, needsEmailConfirm: false });
      } catch {
        return NextResponse.json(
          {
            error:
              "注册需要发送确认邮件，但 Supabase 发送失败。请在 Supabase Auth 的 Email 设置里配置 SMTP 或关闭邮箱确认；或在本项目配置 SUPABASE_SERVICE_ROLE_KEY 以启用免邮件注册。",
          },
          { status: 500 },
        );
      }
    }

    const msg = raw ? `注册失败：${raw}` : "注册失败";
    return NextResponse.json({ error: msg }, { status: error.status ?? 400 });
  }

  const needsEmailConfirm = !data.session;
  return NextResponse.json({ ok: true, needsEmailConfirm });
}
