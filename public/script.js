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

// --- КАЛЬКУЛЯТОР ---
const materialSelect = document.getElementById('material');
const weightInput = document.getElementById('weight');
const quantityInput = document.getElementById('quantity');
const priceSpan = document.getElementById('calc-price');

function calculatePrice() {
    if (!materialSelect || !weightInput) return;
    const val = materialSelect.value;
    const pricePerGram = Number(val.split('|')[1]);   // цена за 1 г
    const weight = Number(weightInput.value) || 0;     // вес одной детали, г
    const quantity = Number(quantityInput.value) || 1; // кол-во деталей

    let total = pricePerGram * weight * quantity;

    if (total > 0 && total < 850) total = 850; // минимальный заказ
    else if (total === 0) total = 0;

    priceSpan.textContent = Math.round(total);
}

materialSelect.addEventListener('change', calculatePrice);
weightInput.addEventListener('input', calculatePrice);
quantityInput.addEventListener('input', calculatePrice);
calculatePrice();

// --- АККОРДЕОН МАТЕРИАЛОВ ---
function toggleMaterial(btn) {
    btn.classList.toggle('active');
    const subtypes = btn.nextElementSibling;
    subtypes.classList.toggle('open');
}

// --- ОТПРАВКА ФОРМЫ ---
document.getElementById('orderForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';

    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('phone', document.getElementById('phone').value);
    formData.append('material', materialSelect.options[materialSelect.selectedIndex].text);
    formData.append('weight', weightInput.value);
    formData.append('quantity', quantityInput.value);
    formData.append('price', priceSpan.textContent);
    formData.append('messenger', document.getElementById('messenger').value);
    formData.append('messenger_contact', document.getElementById('messenger_contact').value);
    formData.append('comment', document.getElementById('comment').value);
    
    const fileInput = document.getElementById('file');
    if (fileInput.files.length > 0) formData.append('file', fileInput.files[0]);

    try {
        const response = await fetch('/api/send-order', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById('successModal').classList.add('active');
            this.reset();
            calculatePrice();
        } else {
            alert('Ошибка: ' + result.message);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось отправить заявку.');
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