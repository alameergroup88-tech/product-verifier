import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3000;

// 1. جلب متغيرات البيئة من Render
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ خطأ: متغيرات البيئة الخاصة بـ Supabase مفقودة!');
  process.exit(1);
}

// 2. إنشاء اتصال Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// 3. إرجاع صفحة الـ HTML عند دخول رابط الموقع الرئيسي (/)
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Document Verification | Final International University</title>

  <style>
    * {
      box-sizing: border-box;
    }

    :root {
      --red: #df3044;
      --red-dark: #cf2639;

      --text: #333;
      --card: rgba(255, 255, 255, 0.97);

      --green-bg: rgba(82, 190, 108, 0.22);
      --green-border: rgba(82, 190, 108, 0.22);
      --green-text: #216b35;

      --error-bg: rgba(239, 68, 68, 0.16);
      --error-border: rgba(220, 38, 38, 0.20);
      --error-text: #a51d2d;

      --button-green: #157347;
      --button-green-dark: #0f5c38;
    }

    html,
    body {
      margin: 0;
      min-height: 100%;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      color: var(--text);
      background: #f7f7f7;
      overflow-x: hidden;
    }

    body::before,
    body::after {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: -1;
      opacity: 0.55;
    }

    body::before {
      background:
        linear-gradient(
          60deg,
          transparent 49%,
          #ededed 50%,
          transparent 51%
        ) 0 0 / 310px 310px,

        linear-gradient(
          -60deg,
          transparent 49%,
          #ededed 50%,
          transparent 51%
        ) 0 0 / 310px 310px;
    }

    body::after {
      background:
        linear-gradient(
          120deg,
          transparent 49%,
          #f0f0f0 50%,
          transparent 51%
        ) 155px 155px / 310px 310px,

        linear-gradient(
          -120deg,
          transparent 49%,
          #f0f0f0 50%,
          transparent 51%
        ) 155px 155px / 310px 310px;
    }

    .page {
      width: 100%;
      padding: 28px 18px 40px;
    }

    .card {
      width: min(675px, 100%);
      margin: 0 auto;

      background: var(--card);

      border: 1px solid #d7d7d7;
      border-radius: 7px;

      padding: 38px 42px 38px;

      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .logo {
      display: block;

      width: min(100%, 575px);
      max-height: 150px;

      object-fit: contain;
      object-position: center;

      margin: 0 auto 22px;
    }

    .language-switch {
      display: grid;

      grid-template-columns: 1fr 1fr;

      width: 100%;

      margin: 0 0 70px;

      border-radius: 8px;
      overflow: hidden;

      box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
    }

    .language-switch button {
      border: 0;

      min-height: 88px;

      padding: 15px;

      background: #ffffff;
      color: #333333;

      font-size: 25px;
      font-weight: 700;

      cursor: pointer;

      transition: 0.2s ease;
    }

    .language-switch button.active {
      background: var(--red);
      color: #ffffff;
    }

    .language-switch button:hover {
      filter: brightness(0.98);
    }
  </style>
</head>
<body>

  <div class="page">
    <div class="card">
      <div class="language-switch">
        <button class="active">English</button>
        <button>Türkçe</button>
      </div>

      <h1 style="text-align: center;">Document Verification</h1>
      <p style="text-align: center;">Welcome to Final International University Verification System</p>
    </div>
  </div>

</body>
</html>
  `);
});

// 4. تشغيل الخادم
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
