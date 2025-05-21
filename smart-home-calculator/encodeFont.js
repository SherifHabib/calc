// encodeFont.js
const fs = require('node:fs'); // استخدام 'node:fs' للإصدارات الحديثة من Node
const path = require('node:path');

// تأكد أن هذا المسار صحيح بالنسبة لمكان ملف الخط الفعلي
const fontPath = path.join(__dirname, 'src', 'assets', 'fonts', 'Amiri-Regular.ttf');
const outputTextFilePath = path.join(__dirname, 'src', 'assets', 'fonts', 'amiriFontBase64.txt'); // لحفظ السلسلة

try {
    if (fs.existsSync(fontPath)) {
        const fontBase64 = fs.readFileSync(fontPath, 'base64');
        fs.writeFileSync(outputTextFilePath, fontBase64); // يحفظ السلسلة في ملف نصي
        console.log(`Font successfully encoded to Base64 and saved to: ${outputTextFilePath}`);
        console.log('Base64 String (first 100 chars for verification):', fontBase64.substring(0, 100) + '...');
        // يمكنك نسخ السلسلة من الملف outputTextFilePath أو من الطرفية إذا كانت قصيرة كفاية للعرض
    } else {
        console.error(`Error: Font file not found at ${fontPath}`);
        console.error('Please ensure you have downloaded Amiri-Regular.ttf and placed it in src/assets/fonts/');
    }
} catch (error) {
    console.error('Error encoding font:', error);
}