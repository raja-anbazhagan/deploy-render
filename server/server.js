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
    // Always extract base64 part from data URL
    const base64Data = image.split(',')[1];
    try {
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(name, buffer);
        res.send(`Image saved successfully as ${name}`);
    } catch (e) {
        res.status(500).send('Error saving image: ' + e.message);
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
