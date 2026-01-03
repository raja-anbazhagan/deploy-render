const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));

app.post('/api/upload', (req, res) => {
    const { image, name } = req.body;
    if (!image) {
        return res.status(400).send('Image data is required');
    }
    let base64Data = image;
    let fileExtension = 'png'; // default
    if (image.startsWith('data:')) {
        const commaIndex = image.indexOf(',');
        if (commaIndex > 0) {
            const header = image.substring(0, commaIndex);
            const parts = header.split(':');
            if (parts.length > 1) {
                const mimeType = parts[1].split(';')[0];
                const mimeParts = mimeType.split('/');
                if (mimeParts.length > 1) {
                    fileExtension = mimeParts[1];
                }
            }
            base64Data = image.substring(commaIndex + 1);
        }
    }
    try {
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(name, buffer);
        res.send(`Image saved successfully as image.${fileExtension}`);
    } catch (e) {
        res.status(500).send('Error saving image: ' + e.message);
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
