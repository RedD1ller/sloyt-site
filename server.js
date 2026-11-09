require('dotenv').config();
const express = require('express');
const { VK } = require('vk-io');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();

const vk = new VK({
    token: process.env.VK_TOKEN
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './public/uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/send-order', upload.single('file'), async (req, res) => {
    const { name, phone, material, weight, price, messenger, messenger_contact, comment } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ success: false, message: 'Заполните имя и телефон' });
    }

    let message = `
🔥 Новая заявка с сайта SloyT!
👤 Имя: ${name}
📞 Телефон: ${phone}
📦 Материал: ${material}
⚖️ Вес: ${weight} гр.
💰 Стоимость: ${price} ₽
    `;

    if (messenger && messenger_contact) {
        message += `📱 Доп. связь: ${messenger} (${messenger_contact})\n`;
    }

    if (req.file) {
        const fileUrl = `https://sloyt.ru/uploads/${req.file.filename}`;
        message += `📎 Файл модели: ${fileUrl}\n`;
    }

    message += `💬 Комментарий: ${comment || 'Не указан'}
⏱ Время: ${new Date().toLocaleString('ru-RU')}`;

    try {
        const peerIds = process.env.VK_PEER_ID.split(',').map(id => Number(id.trim()));
        await vk.api.messages.send({
            peer_ids: peerIds,
            message: message,
            random_id: Date.now()
        });
        res.status(200).json({ success: true, message: 'Заявка отправлена' });
    } catch (error) {
        console.error('Ошибка VK:', error.message);
        res.status(500).json({ success: false, message: 'Ошибка сервера при отправке' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});