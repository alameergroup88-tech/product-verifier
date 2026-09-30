import express from 'express';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL or SUPABASE_KEY missing in environment variables!');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/', async (req, res) => {
  const docNo = req.query.docNo ? req.query.docNo.trim() : null;
  const lang = req.query.lang || 'en';

  let resultData = null;
  let searched = false;

  if (docNo) {
    searched = true;
    const cleanDocNo = docNo.trim();

    // البحث في جدول product_codes دون الحساسية لحالة الأحرف
    const { data, error } = await supabase
      .from('product_codes')
      .select('*')
      .ilike('code', cleanDocNo);

    if (data && data.length > 0 && !error) {
      resultData = {
        pdf_url: data[0].document_url
      };
    }
  }

  // قراءة ملف HTML وتبديل المتغيرات (Templating)
  const htmlPath = path.join(__dirname, 'verifier.html');
  
  fs.readFile(htmlPath, 'utf8', (err, htmlContent) => {
    if (err) {
      return res.status(500).send('Error loading verifier.html template.');
    }

    let rendered = htmlContent;

    const isEn = lang === 'en';
    const isTr = lang === 'tr';

    // استبدال الشروط والقيم داخل الـ HTML
    rendered = rendered.replace(/\{\{lang\}\}/g, lang);
    rendered = rendered.replace(/\{\{docNo\}\}/g, docNo || '');
    rendered = rendered.replace(/\{\{#if isEn\}\}([\s\S]*?)\{\{\/if\}\}/g, isEn ? '$1' : '');
    rendered = rendered.replace(/\{\{#if isTr\}\}([\s\S]*?)\{\{\/if\}\}/g, isTr ? '$1' : '');
    rendered = rendered.replace(/\{\{#if searched\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g, searched ? '$1' : '$2');
    rendered = rendered.replace(/\{\{#if resultData\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g, resultData ? '$1' : '$2');

    if (resultData) {
      rendered = rendered.replace(/\{\{resultData\.pdf_url\}\}/g, resultData.pdf_url);
    }

    res.send(rendered);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
