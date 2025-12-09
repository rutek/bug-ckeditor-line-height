# Bug Report: CKEditor Line Height Conversion Issue

## Pre-requisites

- Node.js installed (v23)

## Running

```shell
npm ci
NODE_NO_WARNINGS=1 CKEDITOR_ENV_ID={...} CKEDITOR_ACCESS_KEY={...} node conversion.ts
```

## Current State

1. Document with different line-heights is exported to DOCX using CKEditor Cloud Services.
2. DOCX is converted to HTML using CKEditor Cloud Services.
3. Resulting HTML has different line-height than initially.

Recorded result (2025-12-09), with new lines to help read it:

```html
<p style="margin-top: 0px; margin-bottom: 12px; line-height: 1.2"><span style="color: #000000; font-size: 13.33px; font-family: Verdana, Geneva, sans-serif">No line height set (default of 1.5)</span></p>

<p style="margin-top: 0px; margin-bottom: 12px; line-height: 1.25"><span style="color: #000000; font-size: 13.33px; font-family: Verdana, Geneva, sans-serif">Line height set to 1.5</span></p>

<p style="margin-top: 0px; margin-bottom: 12px; line-height: 1.67"><span style="color: #000000; font-size: 13.33px; font-family: Verdana, Geneva, sans-serif">Line height set to 2</span></p>
```
