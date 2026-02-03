// ============================================
// THE WARM MESSAGE - Landing Page Scripts
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSmoothScroll();
    initProcessTabs();
    initFAQ();
    initNavScroll();
    initFormFileUpload();
    initListOptionToggle();
    initFormSubmission();
    initAnimations();
});

// ============================================
// List Option Toggle
// ============================================
function initListOptionToggle() {
    const listOptions = document.querySelectorAll('input[name="listOption"]');
    const haveListContent = document.getElementById('have-list-content');
    const buildListContent = document.getElementById('build-list-content');
    const csvFileInput = document.getElementById('csvFile');
    
    if (!listOptions.length) return;
    
    listOptions.forEach(option => {
        option.addEventListener('change', () => {
            if (option.value === 'have-list') {
                haveListContent.style.display = 'block';
                buildListContent.style.display = 'none';
                // Make CSV required, remove required from build fields
                if (csvFileInput) csvFileInput.setAttribute('required', '');
                toggleBuildListRequired(false);
            } else {
                haveListContent.style.display = 'none';
                buildListContent.style.display = 'block';
                // Remove CSV required, make build fields required
                if (csvFileInput) csvFileInput.removeAttribute('required');
                toggleBuildListRequired(true);
            }
        });
    });
}

function toggleBuildListRequired(required) {
    const buildFields = ['targetTitles', 'targetIndustries', 'companySize', 'geography'];
    buildFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (required) {
                field.setAttribute('required', '');
            } else {
                field.removeAttribute('required');
            }
        }
    });
}

// ============================================
// Email Validation (Company emails only)
// ============================================
const personalEmailDomains = [
    'gmail.com', 'yahoo.com', 'yahoo.co.uk', 'hotmail.com', 'hotmail.co.uk',
    'outlook.com', 'outlook.co.uk', 'live.com', 'live.co.uk', 'msn.com',
    'aol.com', 'icloud.com', 'me.com', 'mac.com', 'protonmail.com',
    'proton.me', 'zoho.com', 'yandex.com', 'mail.com', 'gmx.com',
    'inbox.com', 'fastmail.com', 'tutanota.com', 'hey.com', 'pm.me',
    'googlemail.com', 'qq.com', '163.com', '126.com', 'sina.com',
    'rediffmail.com', 'ymail.com', 'rocketmail.com'
];

function isCompanyEmail(email) {
    if (!email) return false;
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    return !personalEmailDomains.includes(domain);
}

// ============================================
// Mobile Menu
// ============================================
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (!mobileMenuBtn || !mobileMenu) return;
    
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
    
    // Close menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    });
}

// ============================================
// Smooth Scrolling
// ============================================
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (!target) return;
            
            e.preventDefault();
            
            const navHeight = document.querySelector('.nav').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

// ============================================
// Process Tabs
// ============================================
function initProcessTabs() {
    const tabs = document.querySelectorAll('.process-tab');
    const contents = document.querySelectorAll('.process-steps');
    
    if (!tabs.length || !contents.length) return;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active content
            contents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetId) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// ============================================
// FAQ Accordion
// ============================================
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (!faqItems.length) return;
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active', !isActive);
        });
    });
}

// ============================================
// Navigation Scroll Effect
// ============================================
function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        } else {
            nav.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
}

// ============================================
// File Upload Visual Feedback
// ============================================
function initFormFileUpload() {
    const fileInput = document.querySelector('#csvFile');
    const fileUpload = document.querySelector('.file-upload');
    const fileUploadText = document.querySelector('.file-upload-text');
    
    if (!fileInput || !fileUpload) return;
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            fileUploadText.textContent = fileName;
            fileUpload.classList.add('has-file');
        } else {
            fileUploadText.textContent = 'Upload CSV or drag and drop';
            fileUpload.classList.remove('has-file');
        }
    });
    
    // Drag and drop styling
    fileUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUpload.classList.add('dragging');
    });
    
    fileUpload.addEventListener('dragleave', () => {
        fileUpload.classList.remove('dragging');
    });
    
    fileUpload.addEventListener('drop', () => {
        fileUpload.classList.remove('dragging');
    });
}

// ============================================
// Form Submission
// ============================================
function initFormSubmission() {
    const form = document.querySelector('#sampleForm');
    
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        const emailInput = form.querySelector('#email');
        const listOption = form.querySelector('input[name="listOption"]:checked')?.value;
        
        // Validate company email
        if (emailInput && !isCompanyEmail(emailInput.value)) {
            showNotification('error', 'Please use your company email address. Personal emails (Gmail, Yahoo, etc.) are not accepted.');
            emailInput.focus();
            return;
        }
        
        // Validate based on list option
        if (listOption === 'have-list') {
            const csvFile = form.querySelector('#csvFile');
            if (!csvFile.files.length) {
                showNotification('error', 'Please upload a CSV file with your prospect list.');
                return;
            }
        } else if (listOption === 'build-list') {
            const requiredFields = ['targetTitles', 'targetIndustries', 'companySize', 'geography'];
            for (const fieldId of requiredFields) {
                const field = form.querySelector(`#${fieldId}`);
                if (!field.value.trim()) {
                    showNotification('error', 'Please fill in all targeting fields to build your list.');
                    field.focus();
                    return;
                }
            }
        }
        
        // Show loading state
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        try {
            // Get form data
            const formData = new FormData(form);
            
            // Send to backend API
            const response = await fetch('/api/submit-sample', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success message
                submitBtn.textContent = '✓ Request Submitted!';
                submitBtn.style.backgroundColor = '#22c55e';
                
                // Show success notification
                showNotification('success', result.message || 'Your request has been submitted! We\'ll send your personalized emails within 20 minutes.');
                
                // Reset form after delay
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = '';
                    form.reset();
                    
                    // Reset file upload text
                    const fileUploadText = document.querySelector('.file-upload-text');
                    if (fileUploadText) {
                        fileUploadText.textContent = 'Upload CSV or drag and drop';
                    }
                    const fileUpload = document.querySelector('.file-upload');
                    if (fileUpload) {
                        fileUpload.classList.remove('has-file');
                    }
                    
                    // Reset list option view
                    document.getElementById('have-list-content').style.display = 'block';
                    document.getElementById('build-list-content').style.display = 'none';
                }, 3000);
            } else {
                // Show error
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                showNotification('error', result.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            showNotification('error', 'Failed to submit. Please try again or contact us directly.');
        }
    });
}

// ============================================
// Notification System
// ============================================
function showNotification(type, message) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✓' : '✕'}</span>
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close">×</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Close button handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ============================================
// Scroll Animations
// ============================================
function initAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe sections for animations
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.add('animate-ready');
        observer.observe(section);
    });
}

// Add animation styles dynamically
const style = document.createElement('style');
style.textContent = `
    .animate-ready {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .file-upload.has-file .file-upload-label {
        border-color: #22c55e;
        background-color: #f0fdf4;
    }
    
    .file-upload.dragging .file-upload-label {
        border-color: #3b82f6;
        background-color: #eff6ff;
    }
    
    .mobile-menu-btn.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .mobile-menu-btn.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-menu-btn.active span:nth-child(3) {
        transform: rotate(-45deg) translate(5px, -5px);
    }
    
    /* Notification Styles */
    .notification {
        position: fixed;
        top: 90px;
        right: 20px;
        max-width: 400px;
        padding: 16px 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        z-index: 10000;
        transform: translateX(120%);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
    }
    
    .notification.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .notification-icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        flex-shrink: 0;
    }
    
    .notification-success .notification-icon {
        background: #22c55e;
        color: white;
    }
    
    .notification-error .notification-icon {
        background: #ef4444;
        color: white;
    }
    
    .notification-message {
        font-size: 14px;
        color: #333;
        line-height: 1.4;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 20px;
        color: #999;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        flex-shrink: 0;
    }
    
    .notification-close:hover {
        color: #333;
    }
    
    @media (max-width: 480px) {
        .notification {
            left: 20px;
            right: 20px;
            max-width: none;
        }
    }
`;
document.head.appendChild(style);

