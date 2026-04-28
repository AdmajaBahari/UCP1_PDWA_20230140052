// DOM Elements
const form = document.getElementById('registration-form');
const inputs = form.querySelectorAll('input[required]');
const submitBtn = form.querySelector('.btn-primary');
const resetBtn = form.querySelector('.btn-secondary');

// Real-time validation
inputs.forEach(input => {
    input.addEventListener('blur', validateField);
    input.addEventListener('input', validateField);
});

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Reset previous states
    field.classList.remove('valid', 'error');
    
    if (field.hasAttribute('required') && !value) {
        field.classList.add('error');
        return false;
    }
    
    if (field.type === 'email' && value && !isValidEmail(value)) {
        field.classList.add('error');
        return false;
    }
    
    field.classList.add('valid');
    return true;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate all required fields
    let isValid = true;
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('❌ Mohon lengkapi semua field dengan benar!', 'error');
        return;
    }

    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Sedang diproses...';
    submitBtn.parentElement.classList.add('loading');

    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('✅ Registration Data:', data);
        showNotification('🎉 Pendaftaran berhasil! Kami akan hubungi Anda segera.', 'success');
        form.reset();
        inputs.forEach(input => input.classList.remove('valid', 'error'));
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('❌ Terjadi kesalahan. Silakan coba lagi.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        submitBtn.parentElement.classList.remove('loading');
    }
});

// Reset functionality
resetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    form.reset();
    inputs.forEach(input => {
        input.classList.remove('valid', 'error');
    });
    showNotification('🔄 Form telah direset!', 'info');
});

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    // Auto remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Dark mode toggle (demo)
document.querySelector('.dark-toggle').addEventListener('click', function() {
    const knob = this.querySelector('.toggle-knob');
    knob.style.transform = knob.style.transform === 'translateX(2.25rem)' ? 
        'translateX(0.25rem)' : 'translateX(2.25rem)';
    
    document.body.classList.toggle('dark-mode');
});

// Smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Window controls interactions (decorative)
document.querySelectorAll('.window-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        // Add ripple effect or other visual feedback
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
});