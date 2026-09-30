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

// 2. مسار الموقع الرئيسي
app.get('/', async (req, res) => {
  const docNo = req.query.docNo ? req.query.docNo.trim() : null;
  const lang = req.query.lang || 'en';

  let resultData = null;
  let searched = false;

  if (docNo) {
    searched = true;
    // الاستعلام المطابق لجدولك في Supabase (product_codes)
    const { data, error } = await supabase
      .from('product_codes')
      .select('*')
      .ilike('code', docNo)
      .maybeSingle();

    if (data && !error) {
      resultData = {
        pdf_url: data.document_url
      };
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
    * {
      box-sizing: border-box;
    }

    :root {
      --red: #df3044;
      --red-dark: #cf2639;
      --text: #333;
      --card: rgba(255, 255, 255, 0.97);
      --green-bg: #d1e7dd;
      --green-text: #0f5132;
      --error-bg: #f8d7da;
      --error-text: #842029;
      --btn-green: #17a2b8;
    }

    html, body {
      margin: 0;
      min-height: 100%;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      color: var(--text);
      background: #f7f7f7;
      overflow-x: hidden;
      padding: 28px 18px 40px;
    }

    /* خلفية متدرجة بأشكال هندسية */
    body::before, body::after {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: -1;
      opacity: 0.55;
    }

    body::before {
      background:
        linear-gradient(60deg, transparent 49%, #ededed 50%, transparent 51%) 0 0 / 310px 310px,
        linear-gradient(-60deg, transparent 49%, #ededed 50%, transparent 51%) 0 0 / 310px 310px;
    }

    body::after {
      background:
        linear-gradient(120deg, transparent 49%, #f0f0f0 50%, transparent 51%) 155px 155px / 310px 310px,
        linear-gradient(-120deg, transparent 49%, #f0f0f0 50%, transparent 51%) 155px 155px / 310px 310px;
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

    /* شعار الجامعة العلوي */
    .logo {
      display: block;
      width: min(100%, 575px);
      max-height: 150px;
      object-fit: contain;
      object-position: center;
      margin: 0 auto 22px;
    }

    /* أزرار اختيار اللغة */
    .language-switch {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: 100%;
      margin: 0 0 35px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
      border: 1px solid #e0e0e0;
    }

    .language-switch a {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 70px;
      padding: 15px;
      background: #ffffff;
      color: #333333;
      font-size: 22px;
      font-weight: 700;
      text-decoration: none;
      transition: 0.2s ease;
    }

    .language-switch a.active {
      background: var(--red);
      color: #ffffff;
    }

    .form-group {
      margin-bottom: 20px;
    }

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
    }

    .btn-red {
      background: var(--red);
      color: #fff;
      border: none;
      padding: 12px 30px;
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

    .example-img {
      display: block;
      max-width: 100%;
      margin: 20px auto;
    }

    /* واجهة عرض نتيجة التحقق */
    .doc-number-title {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 25px;
      color: #333;
    }

    .highlight-red {
      color: var(--red);
    }

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
    <!-- الشعار العلوي للجامعة -->
    <img src="https://raw.githubusercontent.com/alameergroup88-tech/product-verifier/main/logo.png" alt="Final International University Logo" class="logo" onerror="this.src='https://docs.final.edu.tr/assets/img/logo.png'">

    <!-- صناديق الترجمة بين الإنجليزية والتركية -->
    <div class="language-switch">
      <a href="/?lang=en${docNo ? '&docNo=' + encodeURIComponent(docNo) : ''}" class="${lang === 'en' ? 'active' : ''}">English</a>
      <a href="/?lang=tr${docNo ? '&docNo=' + encodeURIComponent(docNo) : ''}" class="${lang === 'tr' ? 'active' : ''}">Türkçe</a>
    </div>

    ${!searched ? `
      <!-- النموذج الرئيسي للبحث (قبل البحث) -->
      <form action="/" method="GET">
        <input type="hidden" name="lang" value="${lang}">
        <div class="form-group">
          <label>${lang === 'en' ? 'Document No' : 'Belge No'}</label>
          <input type="text" name="docNo" required autocomplete="off">
        </div>
        <button type="submit" class="btn-red">${lang === 'en' ? 'Verify' : 'Doğrula'}</button>
      </form>

      <div class="info-text">
        ${lang === 'en' 
          ? 'The document number is located in the lower right corner of the document. Example:' 
          : 'Belge numarası belgenin sağ alt köşesinde yer almaktadır. Örnek:'}
      </div>

      <!-- الصورة التوضيحية من GitHub -->
      <img src="https://raw.githubusercontent.com/alameergroup88-tech/product-verifier/main/verfy-en.png" alt="Verification Example" class="example-img">

      <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">

      <div class="info-text">
        ${lang === 'en' 
          ? 'To inquire about diplomas without a QR code, please enter the student number and diploma number without any spaces in between. For example: 13030100002013-100.' 
          : 'QR kodu olmayan diplomaları sorgulamak için lütfen öğrenci numarası ile diploma numarasını arada boşluk bırakmadan giriniz. Örnek: 13030100002013-100.'}
      </div>
    ` : `
      <!-- واجهة النتائج بعد البحث -->
      <div class="doc-number-title">
        Document No: <span class="highlight-red">${docNo}</span>
      </div>

      ${resultData ? `
        <!-- حالة الكود صحيح -->
        <div class="status-box status-success">
          ✔ Document verified
        </div>

        <div class="preview-title">Preview</div>
        <iframe src="${resultData.pdf_url}" class="preview-frame"></iframe>
      ` : `
        <!-- حالة الكود غير موجود -->
        <div class="status-box status-error">
          ✖ The verification code cannot be found
        </div>
      `}

      <!-- زر إعادة البحث -->
      <a href="/?lang=${lang}" class="btn-check-another">
        Check<br>another<br>document
      </a>
    `}
  </div>

</body>
</html>
  `);
});

// 3. تشغيل الخادم
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
