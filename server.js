require('dotenv').config();
const express = require('express');
const { VK } = require('vk-io');
const path = require('path');

const app = express();

const vk = new VK({
    token: process.env.VK_TOKEN
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/send-order', async (req, res) => {
    const { name, phone, messenger, messenger_contact, comment } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ success: false, message: 'Заполните имя и телефон' });
    }

    // Формируем сообщение
    let message = `
🔥 Новая заявка с сайта SloyT!
👤 Имя: ${name}
📞 Телефон: ${phone}
    `;

    // Если указан дополнительный мессенджер, добавляем его
    if (messenger && messenger_contact) {
        message += `📱 Доп. связь: ${messenger} (${messenger_contact})\n`;
    }

    message += `💬 Комментарий: ${comment || 'Не указан'}
⏱ Время: ${new Date().toLocaleString('ru-RU')}`;

    try {
        const peerIds = process.env.VK_PEER_ID
            .split(',')
            .map(id => Number(id.trim()));

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