# Gym Helper — шаблон письма подтверждения email в Supabase

Supabase Dashboard -> Authentication -> Email Templates -> Confirm signup.

Subject:
Подтвердите аккаунт в Gym Helper

Body / HTML:

```html
<div style="font-family: Inter, Arial, sans-serif; background:#020617; padding:32px; color:#e5e7eb;">
  <div style="max-width:520px; margin:0 auto; background:#0f172a; border:1px solid #1e293b; border-radius:24px; padding:28px;">
    <div style="font-size:13px; letter-spacing:.16em; text-transform:uppercase; color:#67e8f9; font-weight:800;">Gym Helper</div>
    <h1 style="margin:12px 0 10px; font-size:26px; line-height:1.2; color:#ffffff;">Подтвердите email</h1>
    <p style="margin:0 0 20px; color:#cbd5e1; line-height:1.6;">Вы зарегистрировались в Gym Helper — приложении для тренировок, питания и отслеживания веса.</p>
    <a href="{{ .ConfirmationURL }}" style="display:inline-block; background:#67e8f9; color:#082f49; text-decoration:none; font-weight:900; padding:14px 18px; border-radius:16px;">Подтвердить аккаунт</a>
    <p style="margin:22px 0 0; color:#94a3b8; font-size:13px; line-height:1.5;">Если кнопка не открывается, скопируйте ссылку ниже в браузер:</p>
    <p style="word-break:break-all; color:#67e8f9; font-size:12px;">{{ .ConfirmationURL }}</p>
  </div>
</div>
```

Для имени отправителя обычно нужен Custom SMTP: Authentication -> Emails / SMTP Settings. Sender name можно указать как `Gym Helper`.
