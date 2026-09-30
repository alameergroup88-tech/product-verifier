import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL or SUPABASE_KEY missing!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// رابط الشعار المباشر من مستودع GitHub الخاص بك
const LOGO_URL = "https://raw.githubusercontent.com/alameergroup88-tech/product-verifier/main/logo.png";

// رابط الصورة التوضيحية المباشر كاملاً من GitHub
const EXAMPLE_IMG_URL = "https://raw.githubusercontent.com/alameergroup88-tech/product-verifier/main/verfy-en.png";

function getPageHtml({ lang, docNo, searched, resultData }) {
  const isEn = lang !== 'tr';
  const isTr = lang === 'tr';

  return `<!DOCTYPE html>
<html lang="${lang}" translate="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="google" content="notranslate">
  <title>Document Verification | Final International University</title>
  <style>
    * { box-sizing: border-box; }
    :root {
      --red: #df3044;
      --red-dark: #cf2639;
      --text: #333;
      --card: rgba(255, 255, 255, 0.98);
      --green-bg: rgba(82, 190, 108, 0.22);
      --green-border: rgba(82, 190, 108, 0.35);
      --green-text: #1b632e;
      --error-bg: rgba(239, 68, 68, 0.16);
      --error-border: rgba(220, 38, 38, 0.25);
      --error-text: #a51d2d;
      --btn-green: #157347;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: var(--text);
      background: #f7f7f7;
      margin: 0;
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
    /* الشعار العلوي */
    .logo {
      display: block;
      width: min(100%, 450px);
      max-height: 130px;
      object-fit: contain;
      margin: 0 auto 25px;
    }
    /* صندوق اختيار اللغة */
    .language-switch {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: 100%;
      margin: 0 0 35px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
      border: 1px solid #e0e0e0;
    }
    .language-switch a {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 65px;
      padding: 10px;
      background: #ffffff;
      color: #333333;
      font-size: 22px;
      font-weight: 700;
      text-decoration: none;
      transition: background 0.2s ease, color 0.2s ease;
    }
    .language-switch a.active {
      background: var(--red);
      color: #ffffff;
    }
    .form-group { margin-bottom: 20px; }
    label {
      font-weight: bold;
      font-size: 20px;
      font-style: italic;
      display: block;
      margin-bottom: 10px;
    }
    input[type="text"] {
      width: 100%;
      padding: 14px;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 18px;
      outline: none;
    }
    .btn-red {
      background: var(--red);
      color: #fff;
      border: none;
      padding: 12px 35px;
      font-size: 20px;
      font-style: italic;
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 30px;
    }
    .info-text {
      text-align: center;
      font-style: italic;
      color: #555;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    /* الصورة التوضيحية كاملة ومناسبة لجميع الشاشات */
    .example-img {
      display: block;
      max-width: 100%;
      height: auto;
      margin: 20px auto;
      border-radius: 4px;
    }
    .doc-number-title {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 25px;
      color: #333;
    }
    .highlight-red { color: var(--red); }
    .status-box {
      padding: 16px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 25px;
    }
    .status-success {
      background-color: var(--green-bg);
      border: 1px solid var(--green-border);
      color: var(--green-text);
    }
    .status-error {
      background-color: var(--error-bg);
      border: 1px solid var(--error-border);
      color: var(--error-text);
    }
    .preview-title {
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .preview-frame {
      width: 100%;
      height: 600px;
      border: 1px solid #ccc;
      margin-bottom: 30px;
      background: #eee;
    }
    .btn-check-another {
      display: block;
      width: 220px;
      margin: 30px auto 0;
      background: var(--btn-green);
      color: #fff;
      text-align: center;
      padding: 14px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      font-size: 16px;
      line-height: 1.3;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="card">
    <!-- الشعار العلوي المباشر -->
    <img src="${LOGO_URL}" alt="Final International University" class="logo">

    <!-- أزرار اختيار اللغة -->
    <div class="language-switch">
      <a href="/?lang=en${docNo ? '&docNo=' + encodeURIComponent(docNo) : ''}" class="${isEn ? 'active' : ''}">English</a>
      <a href="/?lang=tr${docNo ? '&docNo=' + encodeURIComponent(docNo) : ''}" class="${isTr ? 'active' : ''}">Türkçe</a>
    </div>

    ${searched ? `
      <!-- الشاشة الثانية: بعد كتابة الكود -->
      <div class="doc-number-title">
        Document No: <span class="highlight-red">${docNo}</span>
      </div>

      ${resultData ? `
        <!-- صندوق أخضر شفاف عند صحة الكود -->
        <div class="status-box status-success">
          ✓ Document verified
        </div>
        <div class="preview-title">preview</div>
        <iframe src="${resultData.pdf_url}" class="preview-frame"></iframe>
      ` : `
        <!-- صندوق أحمر شفاف عند خطأ الكود -->
        <div class="status-box status-error">
          X The verification code cannot be find
        </div>
      `}

      <!-- زر إعادة البحث الأخضر -->
      <a href="/?lang=${lang}" class="btn-check-another">
        Check<br>Anther<br>Document
      </a>
    ` : `
      <!-- الشاشة الأولى: نموذج البحث -->
      <form action="/" method="GET">
        <input type="hidden" name="lang" value="${lang}">
        <div class="form-group">
          <label>${isTr ? 'Belge No' : 'Document no'}</label>
          <input type="text" name="docNo" required autocomplete="off">
        </div>
        <button type="submit" class="btn-red">${isTr ? 'Doğrula' : 'Verify'}</button>
      </form>

      <div class="info-text">
        ${isTr ? 'Belge numarası belgenin sağ alt köşesinde yer almaktadır. Örnek:' 
               : 'The document number is located in the lower right corner of the document. Example:'}
      </div>

      <!-- الصورة التوضيحية كاملة -->
      <img src="${EXAMPLE_IMG_URL}" alt="Document Verification Example" class="example-img">

      <hr style="border:0; border-top:1px solid #eee; margin:25px 0;">

      <div class="info-text">
        ${isTr ? 'QR kodu olmayan diplomaları sorgulamak için lütfen öğrenci numarası ile diploma numarasını arada boşluk bırakmadan giriniz. Örnek: 13030100002013-100.' 
               : 'To inquire about diplomas without a QR code, please enter the student number and diploma number without any spaces in between. For example: 13030100002013-100.'}
      </div>
    `}
  </div>
</body>
</html>`;
}

app.get('/', async (req, res) => {
  const docNo = req.query.docNo ? req.query.docNo.trim() : null;
  const lang = req.query.lang || 'en';

  let resultData = null;
  let searched = false;

  if (docNo) {
    searched = true;
    try {
      const { data, error } = await supabase
        .from('product_codes')
        .select('*')
        .ilike('code', docNo);

      if (data && data.length > 0 && !error) {
        resultData = {
          pdf_url: data[0].document_url
        };
      }
    } catch (e) {
      console.error('Supabase query error:', e);
    }
  }

  const html = getPageHtml({ lang, docNo, searched, resultData });
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
