import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3000;

// 1. جلب متغيرات البيئة
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ خطأ: متغيرات البيئة الخاصة بـ Supabase مفقودة!');
  process.exit(1);
}

// 2. إنشاء الاتصال بـ Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ تم الاتصال بـ Supabase بنجاح!');

// 3. مسار رئيسي للتأكد من عمل الخادم
app.get('/', (req, res) => {
  res.send('Server is running smoothly!');
});

// 4. تشغيل الخادم للاستماع على الـ Port (يمنع السيرفر من الإغلاق)
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
