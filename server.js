import { createClient } from '@supabase/supabase-js';

// 1. جلب المتغيرات من بيئة التشغيل
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// 2. التحقق من وجود المتغيرات للوقاية من الأخطاء
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ خطأ: متغيرات البيئة الخاصة بـ Supabase مفقودة!');
  console.error(`- SUPABASE_URL: ${supabaseUrl ? 'موجود' : 'مفقود ❌'}`);
  console.error(`- SUPABASE_KEY: ${supabaseKey ? 'موجود' : 'مفقود ❌'}`);
  
  // إنهاء العملية لو المتغيرات مش موجودة لمنع الـ Crash غير المفهوم
  process.exit(1);
}

// 3. إنشاء الاتصال بنجاح
export const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ تم الاتصال بـ Supabase بنجاح!');
