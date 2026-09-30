import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. جلب متغيرات البيئة من Render
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ خطأ: متغيرات البيئة مفقودة!');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// 2. المكون البرمجي للواجهة (HTML/CSS/JS)
app.get('/', async (req, res) => {
  const docNo = req.query.docNo ? req.query.docNo.trim() : null;
  const lang = req.query.lang || 'en';

  let resultData = null;
  let searched = false;

  if (docNo) {
    searched = true;
    // البحث داخل جدول documents في Supabase بواسطة رقم الوثيقة
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('doc_no', docNo)
      .single();

    if (data && !error) {
      resultData = data;
    }
  }

  res.send(`
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document Verification | Final International University</title>
  <style>
    * { box-sizing: border-box; }
    :root {
      --red: #df3044;
      --text: #333;
      --card: #ffffff;
      --green-bg: #d1e7dd;
      --green-text: #0f5132;
      --error-bg: #f8d7da;
      --error-text: #842029;
      --btn-green: #17a2b8;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: var(--text);
      background: #f7f7f7;
      margin: 0;
      padding: 20px 10px;
    }
    .card {
      width: min(100%, 550px);
      margin: 0 auto;
      background: var(--card);
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 30px 25px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .logo {
      display: block;
      max-width: 320px;
      width: 100%;
      margin: 0 auto 25px;
    }
    .language-switch {
      display: flex;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #e0e0e0;
      margin-bottom: 25px;
    }
    .language-switch a {
      flex: 1;
      text-align: center;
      padding: 12px;
      text-decoration: none;
      font-weight: bold;
      font-size: 18px;
      color: #333;
      background: #fff;
    }
    .language-switch a.active {
      background: var(--red);
      color: #fff;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      font-weight: bold;
      font-size: 18px;
      font-style: italic;
      display: block;
      margin-bottom: 8px;
    }
    input[type="text"] {
      width: 100%;
      padding: 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 16px;
    }
    .btn-red {
      background: var(--red);
      color: #fff;
      border: none;
      padding: 10px 25px;
      font-size: 18px;
      font-style: italic;
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 25px;
    }
    .info-text {
      text-align: center;
      font-style: italic;
      color: #555;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 15px;
    }
    .example-img {
      display: block;
      max-width: 100%;
      margin: 15px auto;
    }
    /* نتيجة التحقق */
    .doc-number-title {
      font-size: 22px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 20px;
    }
    .highlight-red {
      color: var(--red);
    }
    .status-box {
      padding: 15px;
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
      color: var(--green-text);
    }
    .status-error {
      background-color: var(--error-bg);
      color: var(--error-text);
    }
    .preview-title {
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .preview-frame {
      width: 100%;
      height: 500px;
      border: 1px solid #ccc;
      margin-bottom: 25px;
      background: #777;
    }
    .btn-check-another {
      display: block;
      width: 220px;
      margin: 20px auto 0;
      background: var(--btn-green);
      color: #fff;
      text-align: center;
      padding: 12px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      font-size: 16px;
      line-height: 1.2;
    }
  </style>
</head>
<body>

  <div class="card">
    <!-- الشعار العلوي -->
    <img src="https://raw.githubusercontent.com/alameergroup88-tech/product-verifier/main/logo.png" alt="University Logo" class="logo" onerror="this.src='https://docs.final.edu.tr/assets/img/logo.png'">

    <!-- أزرار اختيار اللغة -->
    <div class="language-switch">
      <a href="/?lang=en${docNo ? '&docNo=' + docNo : ''}" class="${lang === 'en' ? 'active' : ''}">English</a>
      <a href="/?lang=tr${docNo ? '&docNo=' + docNo : ''}" class="${lang === 'tr' ? 'active' : ''}">Türkçe</a>
    </div>

    ${!searched ? `
      <!-- النموذج الابتدائي قبل الإدخال -->
      <form action="/" method="GET">
        <input type="hidden" name="lang" value="${lang}">
        <div class="form-group">
          <label>${lang === 'en' ? 'Document No' : 'Belge No'}</label>
          <input type="text" name="docNo" required>
        </div>
        <button type="submit" class="btn-red">${lang === 'en' ? 'Verify' : 'Doğrula'}</button>
      </form>

      <div class="info-text">
        ${lang === 'en' 
          ? 'The document number is located in the lower right corner of the document. Example:' 
          : 'Belge numarası belgenin sağ alt köşesinde yer almaktadır. Örnek:'}
      </div>

      <!-- صورة المساعدة من GitHub -->
      <img src="https://raw.githubusercontent.com/alameergroup88-tech/product-verifier/main/verfy-en.png" alt="Example" class="example-img">

      <div class="info-text">
        ${lang === 'en' 
          ? 'To inquire about diplomas without a QR code, please enter the student number and diploma number without any spaces in between. For example: 13030100002013-100.' 
          : 'QR kodu olmayan diplomaları sorgulamak için lütfen öğrenci numarası ile diploma numarasını arada boşluk bırakmadan giriniz. Örnek: 13030100002013-100.'}
      </div>
    ` : `
      <!-- واجهة العرض عند إدخال الكود -->
      <div class="doc-number-title">
        Document No: <span class="highlight-red">${docNo}</span>
      </div>

      ${resultData ? `
        <!-- في حال كان الكود صحيح -->
        <div class="status-box status-success">
          ✔ Document verified
        </div>

        <div class="preview-title">Preview</div>
        <iframe src="${resultData.pdf_url}" class="preview-frame"></iframe>
      ` : `
        <!-- في حال كان الكود خاطئ -->
        <div class="status-box status-error">
          ✖ The verification code cannot be found
        </div>
      `}

      <a href="/?lang=${lang}" class="btn-check-another">
        Check<br>another<br>document
      </a>
    `}
  </div>

</body>
</html>
  `);
});

// 3. تشغيل خادم الاستماع
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
