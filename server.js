app.get('/api/verify-code', async (req, res) => {
  try {
    const rawCode = req.query.code;
    if (!rawCode) return res.status(400).json({ status: 'invalid', message: 'Code is required' });

    const cleanCode = rawCode.trim();

    // الاستعلام عن الكود
    const { data: record, error } = await supabase
      .from('product_codes')
      .select('*')
      .ilike('code', cleanCode)
      .maybeSingle();

    if (error) {
      console.error('تفاصيل خطأ Supabase:', error.message, error.details, error.hint);
      return res.status(500).json({ status: 'error', message: 'Database error', details: error.message });
    }

    if (!record) return res.json({ status: 'not_found' });

    return res.json({
      status: 'authentic',
      productName: record.product_name,
      documentUrl: record.document_url
    });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});
