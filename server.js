const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

// ===============================
// SUPABASE
// ===============================

const SUPABASE_URL =
    process.env.SUPABASE_URL ||
    "https://uzsxfezdglgynjsgtqdo.supabase.co";

const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
    console.error("ERROR: SUPABASE_KEY is missing!");
}

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ===============================
// VERIFY CODE API
// ===============================

app.get("/api/verify-code", async (req, res) => {

    try {

        const rawCode = req.query.code;

        if (!rawCode) {

            return res.status(400).json({
                status: "invalid",
                message: "Code is required"
            });
        }

        const cleanCode =
            String(rawCode).trim();


        // البحث عن الكود بدون حساسية لحالة الأحرف
        const {
            data: record,
            error
        } = await supabase
            .from("product_codes")
            .select("*")
            .ilike("code", cleanCode)
            .maybeSingle();


        // خطأ قاعدة البيانات
        if (error) {

            console.error(
                "Supabase query error:",
                error
            );

            return res.status(500).json({
                status: "error",
                message: "Database error"
            });
        }


        // الكود غير موجود
        if (!record) {

            return res.json({
                status: "not_found"
            });
        }


        // ===============================
        // UPDATE SCAN COUNT
        // ===============================

        const currentScanCount =
            Number(record.scan_count || 0) + 1;

        const now =
            new Date().toISOString();

        const updateData = {
            scan_count: currentScanCount
        };


        if (!record.scanned_at) {

            updateData.scanned_at = now;
        }


        const {
            error: updateError
        } = await supabase
            .from("product_codes")
            .update(updateData)
            .eq("id", record.id);


        if (updateError) {

            console.error(
                "Supabase update error:",
                updateError
            );
        }


        // ===============================
        // VERIFIED DOCUMENT
        // ===============================

        if (currentScanCount === 1) {

            return res.json({

                status: "authentic",

                productName:
                    record.product_name,

                documentUrl:
                    record.document_url,

                message:
                    "This document is verified and authentic."
            });
        }


        // ===============================
        // SCANNED BEFORE
        // ===============================

        return res.json({

            status: "scanned_before",

            productName:
                record.product_name,

            documentUrl:
                record.document_url,

            scanCount:
                currentScanCount,

            firstScanDate:
                record.scanned_at || now,

            message:
                "This document has been verified previously."
        });


    } catch (error) {

        console.error(
            "Server error:",
            error
        );

        return res.status(500).json({

            status: "error",

            message:
                "Internal server error"
        });
    }
});


// ===============================
// WEBSITE
// ===============================

// Express 5-compatible catch-all
app.get(/.*/, (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "verify.html"
        )
    );
});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Server is running on port ${PORT}`
    );
});
