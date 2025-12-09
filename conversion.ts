import fs from 'fs';
import { SignJWT } from 'jose';

const BASE_URI = 'https://docx-converter.cke-cs.com';

const CKEDITOR_ENV_ID: string = process.env.CKEDITOR_ENV_ID || '';
if (!CKEDITOR_ENV_ID) {
    throw new Error('CKEDITOR_ENV_ID environment variable is not set');
}

const CKEDITOR_ACCESS_KEY: string = process.env.CKEDITOR_ACCESS_KEY || '';
if (!CKEDITOR_ACCESS_KEY) {
    throw new Error('CKEDITOR_ACCESS_KEY environment variable is not set');
}

const USER_ID = "e0b2f3c4-5d6e-4f7a-8b9c-0d1e2f3a4b5c";

const DOCX_TO_HTML_OPTIONS = {
    collaboration_features:{
        comments:true,
        user_id: USER_ID,
        track_changes:true
    },
    merge_fields:{
        prefix:"{{",
        suffix:"}}"
    },
    formatting:{
        comments:"basic",
        resets:"inline",
        defaults:"inline",
        styles:"inline"
    },
    timezone:"US/Eastern",
};

async function main(): Promise<void> {
    // Build JWT token for calling API
    const token = await new SignJWT({
        aud: CKEDITOR_ENV_ID,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (30 * 60), // Token valid for 30 minutes
        sub: USER_ID,
        user: {
            name: "John Doe",
            email: "john.doe@example.com",
            avatar: 'https://example.com/avatar.jpg',
        }
    }).setProtectedHeader({ alg: 'HS256' }).sign(Buffer.from(CKEDITOR_ACCESS_KEY, 'utf-8'));


    // STEP 1: Convert to DOCX file that contains few paragraphs with different line-heights
    const htmlFile = fs.readFileSync('test_document.html', 'utf-8');

    const docxConversionResult = await fetch(`${BASE_URI}/v2/convert/html-docx`, {
        method: 'POST',
        headers: {
            'Authorization': token,
        },
        body: JSON.stringify({
            config: {
                collaboration_features: { comment_threads: [],  suggestions: [] },
                merge_fields: {prefix: "{{", suffix: "}}"},
                timezone: 'US/Eastern',
                document: {
                    margins: {
                        top: "36px",
                        bottom: "36px",
                        left: "36px",
                        right: "36px"
                    }
                }
            },
            html: htmlFile,
            css: `
                table {
                    border-style: none;
                    border-collapse: collapse;
                    border-width: 1px;
                    border-color: #dddddd;
                }
                td, th {
                    border-style: none;
                    border-width: 1px;
                    border-color: #dddddd;
                }
                body {
                    font-family: Verdana, Geneva, sans-serif;
                    font-size: 10pt;
                }
                p {
                    margin: 0px 0px 12px 0px;
                }
            `
        }),
    });
    const docxFromHtml = await docxConversionResult.blob();
    console.log('-------------------------');
    console.log('# Converted back to DOCX, status:', docxConversionResult.status);

    // STEP 2::Convert it to HTML once again and print it to see line-height difference
    const formData = new FormData();
    formData.append('config', JSON.stringify(DOCX_TO_HTML_OPTIONS));
    formData.append('file', docxFromHtml, 'file.docx');

    const finalHtmlConversionResult = await fetch(`${BASE_URI}/v2/convert/docx-html`, {
        method: 'POST',
        headers: {
            'Authorization': token,
        },
        body: formData,
    });

    const json = await finalHtmlConversionResult.json() as {html: string};
    const finalHtmlFile = json.html;

    console.log('-------------------------');
    console.log('# Final HTML after round-trip DOCX conversion:');
    console.log(finalHtmlFile);
}

main();
