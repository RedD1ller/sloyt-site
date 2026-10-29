// Анимация появления блоков при скролле
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    document.querySelectorAll('.fade-in-up').forEach(element => {
        observer.observe(element);
    });
});

// Отправка формы
document.getElementById('orderForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';

    // Собираем данные
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        messenger: document.getElementById('messenger').value,
        messenger_contact: document.getElementById('messenger_contact').value,
        comment: document.getElementById('comment').value
    };

    try {
        const response = await fetch('/api/send-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById('successModal').classList.add('active');
            this.reset();
        } else {
            alert('Ошибка: ' + result.message);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось отправить заявку. Проверьте интернет-соединение.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

function closeModal() {
    document.getElementById('successModal').classList.remove('active');
}

document.getElementById('successModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});