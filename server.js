const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

/*
====================================================
MIDDLEWARE
====================================================
*/

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

/*
====================================================
STATIC WEBSITE
====================================================
*/

app.use(express.static(path.join(__dirname)));

/*
====================================================
DATABASE
====================================================

إذا كنت تستخدم PostgreSQL على Render،
ضع DATABASE_URL في Environment Variables.

مثال:

DATABASE_URL=postgresql://....

*/

let pool = null;

if (process.env.DATABASE_URL) {

    const { Pool } = require("pg");

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,

        ssl: {
            rejectUnauthorized: false
        }
    });

}


/*
====================================================
CREATE TABLE
====================================================
*/

async function createTable() {

    if (!pool) {

        console.log(
            "DATABASE_URL is not configured."
        );

        return;

    }

    try {

        await pool.query(`

            CREATE TABLE IF NOT EXISTS product_codes (

                id SERIAL PRIMARY KEY,

                product_name VARCHAR(255) NOT NULL,

                code VARCHAR(64) NOT NULL UNIQUE,

                document_url TEXT NOT NULL,

                scan_count INTEGER NOT NULL DEFAULT 0,

                scanned_at TIMESTAMP NULL,

                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

            );

        `);

        console.log(
            "Database table is ready."
        );

    }

    catch (error) {

        console.error(
            "Database initialization error:",
            error
        );

    }

}


/*
====================================================
HOME PAGE
====================================================
*/

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


/*
====================================================
VERIFY DOCUMENT
====================================================

GET:

/api/verify-code?code=C12345IU

====================================================
*/

app.get(
    "/api/verify-code",
    async (req, res) => {

        try {

            const code =
                String(req.query.code || "").trim();


            /*
            ------------------------------------------
            Check empty code
            ------------------------------------------
            */

            if (!code) {

                return res.status(400).json({

                    status: "error",

                    message:
                        "Verification code is required."

                });

            }


            /*
            ------------------------------------------
            Check database
            ------------------------------------------
            */

            if (!pool) {

                return res.status(500).json({

                    status: "error",

                    message:
                        "Database is not configured."

                });

            }


            /*
            ------------------------------------------
            Find document
            ------------------------------------------
            */

            const result =
                await pool.query(

                    `

                    SELECT
                        id,
                        product_name,
                        code,
                        document_url,
                        scan_count,
                        scanned_at

                    FROM product_codes

                    WHERE code = $1

                    LIMIT 1

                    `,

                    [code]

                );


            /*
            ------------------------------------------
            Code not found
            ------------------------------------------
            */

            if (result.rows.length === 0) {

                return res.status(404).json({

                    status: "not_found",

                    message:
                        "The verification code cannot be find."

                });

            }


            const document =
                result.rows[0];


            /*
            ------------------------------------------
            Check if this code was scanned before
            ------------------------------------------
            */

            const wasScannedBefore =
                document.scan_count > 0;


            /*
            ------------------------------------------
            Increase scan count
            ------------------------------------------
            */

            await pool.query(

                `

                UPDATE product_codes

                SET

                    scan_count =
                        scan_count + 1,

                    scanned_at =
                        CURRENT_TIMESTAMP

                WHERE id = $1

                `,

                [document.id]

            );


            /*
            ------------------------------------------
            Return result
            ------------------------------------------
            */

            return res.json({

                status:
                    wasScannedBefore
                        ? "scanned_before"
                        : "authentic",

                message:
                    "Document verified.",

                productName:
                    document.product_name,

                code:
                    document.code,

                documentUrl:
                    document.document_url,

                scanCount:
                    document.scan_count + 1,

                scannedAt:
                    new Date().toISOString()

            });

        }

        catch (error) {

            console.error(
                "Verification error:",
                error
            );


            return res.status(500).json({

                status: "error",

                message:
                    "Server error."

            });

        }

    }
);


/*
====================================================
ADD NEW DOCUMENT
====================================================

POST:

/api/add-code

JSON:

{
    "productName": "Certificate",
    "code": "C12345IU",
    "documentUrl": "https://example.com/document.pdf"
}

====================================================
*/

app.post(
    "/api/add-code",
    async (req, res) => {

        try {

            const {
                productName,
                code,
                documentUrl
            } = req.body;


            /*
            ------------------------------------------
            Validate
            ------------------------------------------
            */

            if (
                !productName ||
                !code ||
                !documentUrl
            ) {

                return res.status(400).json({

                    status: "error",

                    message:
                        "productName, code and documentUrl are required."

                });

            }


            /*
            ------------------------------------------
            Database check
            ------------------------------------------
            */

            if (!pool) {

                return res.status(500).json({

                    status: "error",

                    message:
                        "Database is not configured."

                });

            }


            /*
            ------------------------------------------
            Insert
            ------------------------------------------
            */

            const result =
                await pool.query(

                    `

                    INSERT INTO product_codes
                    (
                        product_name,
                        code,
                        document_url
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3
                    )

                    RETURNING *

                    `,

                    [
                        productName,
                        code.trim(),
                        documentUrl
                    ]

                );


            /*
            ------------------------------------------
            Success
            ------------------------------------------
            */

            return res.status(201).json({

                status: "created",

                message:
                    "Document code created successfully.",

                document:
                    result.rows[0]

            });

        }

        catch (error) {

            console.error(
                "Add code error:",
                error
            );


            /*
            Duplicate code
            */

            if (
                error.code === "23505"
            ) {

                return res.status(409).json({

                    status: "duplicate",

                    message:
                        "This verification code already exists."

                });

            }


            return res.status(500).json({

                status: "error",

                message:
                    "Server error."

            });

        }

    }
);


/*
====================================================
GET DOCUMENT INFORMATION
====================================================
*/

app.get(
    "/api/document/:code",
    async (req, res) => {

        try {

            const code =
                String(
                    req.params.code || ""
                ).trim();


            if (!pool) {

                return res.status(500).json({

                    status: "error",

                    message:
                        "Database is not configured."

                });

            }


            const result =
                await pool.query(

                    `

                    SELECT
                        id,
                        product_name,
                        code,
                        document_url,
                        scan_count,
                        scanned_at,
                        created_at

                    FROM product_codes

                    WHERE code = $1

                    LIMIT 1

                    `,

                    [code]

                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({

                    status: "not_found",

                    message:
                        "Document not found."

                });

            }


            return res.json({

                status: "success",

                document:
                    result.rows[0]

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                status: "error",

                message:
                    "Server error."

            });

        }

    }
);


/*
====================================================
404
====================================================
*/

app.use(
    (req, res) => {

        res.status(404).json({

            status: "not_found",

            message:
                "Page or API endpoint not found."

        });

    }
);


/*
====================================================
START SERVER
====================================================
*/

async function startServer() {

    await createTable();

    app.listen(
        PORT,
        () => {

            console.log(
                `Server running on port ${PORT}`
            );

        }
    );

}

startServer();
