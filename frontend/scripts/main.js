// Main application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadStats();
});

// Initialize application
function initializeApp() {
    console.log('🚀 EduChain application initialized');
    
    // Set current date as default for issue date
    const issueDateInput = document.getElementById('issue-date');
    if (issueDateInput) {
        const today = new Date().toISOString().split('T')[0];
        issueDateInput.value = today;
    }
}

// Set up event listeners
function setupEventListeners() {
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Certificate form submission
    const certificateForm = document.getElementById('certificate-form');
    if (certificateForm) {
        certificateForm.addEventListener('submit', handleCertificateSubmission);
    }
    
    // Enter key listeners for search inputs
    const certificateIdInput = document.getElementById('certificate-id');
    if (certificateIdInput) {
        certificateIdInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                verifyCertificate();
            }
        });
    }
    
    const studentSearchInput = document.getElementById('student-search');
    if (studentSearchInput) {
        studentSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchByStudent();
            }
        });
    }
    
    const institutionSearchInput = document.getElementById('institution-search');
    if (institutionSearchInput) {
        institutionSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchByInstitution();
            }
        });
    }
}

// Show specific section
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to corresponding nav link
    const targetNavLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (targetNavLink) {
        targetNavLink.classList.add('active');
    }
    
    // Load section-specific data
    switch(sectionName) {
        case 'home':
            loadStats();
            break;
        case 'explorer':
            loadBlockchain();
            break;
    }
}

// Handle certificate form submission
async function handleCertificateSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const certificateData = {
        studentName: formData.get('studentName'),
        institutionName: formData.get('institutionName'),
        courseName: formData.get('courseName'),
        grade: formData.get('grade'),
        issueDate: formData.get('issueDate')
    };
    
    // Validate form data
    if (!validateCertificateData(certificateData)) {
        return;
    }
    
    try {
        showLoading(true);
        const response = await issueCertificate(certificateData);
        
        if (response.success) {
            displayIssueResult(response, 'success');
            e.target.reset();
            // Set today's date again
            document.getElementById('issue-date').value = new Date().toISOString().split('T')[0];
            // Refresh stats
            loadStats();
        } else {
            displayIssueResult(response, 'error');
        }
    } catch (error) {
        console.error('Error issuing certificate:', error);
        displayIssueResult({ message: 'Network error. Please try again.' }, 'error');
    } finally {
        showLoading(false);
    }
}

// Validate certificate data
function validateCertificateData(data) {
    const requiredFields = ['studentName', 'institutionName', 'courseName', 'grade', 'issueDate'];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showNotification(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
            return false;
        }
    }
    
    // Validate date
    const issueDate = new Date(data.issueDate);
    const today = new Date();
    if (issueDate > today) {
        showNotification('Issue date cannot be in the future', 'error');
        return false;
    }
    
    return true;
}

// Display certificate issue result
function displayIssueResult(response, type) {
    const resultContainer = document.getElementById('issue-result');
    
    if (type === 'success') {
        const certificate = response.data.certificate;
        resultContainer.innerHTML = `
            <div class="result-success">
                <h3><i class="fas fa-check-circle"></i> Certificate Issued Successfully!</h3>
                <div class="certificate-display">
                    <div class="certificate-header">
                        <div class="certificate-id">Certificate ID: ${certificate.certificateId}</div>
                        <div class="text-success">✓ Added to Blockchain</div>
                    </div>
                    <div class="certificate-details">
                        <div class="detail-item">
                            <span class="detail-label">Student Name</span>
                            <span class="detail-value">${certificate.studentName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Institution</span>
                            <span class="detail-value">${certificate.institutionName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Course</span>
                            <span class="detail-value">${certificate.courseName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Grade</span>
                            <span class="detail-value">${certificate.grade}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Issue Date</span>
                            <span class="detail-value">${certificate.issueDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Certificate Hash</span>
                            <span class="detail-value" style="font-family: monospace; font-size: 0.9rem; word-break: break-all;">${certificate.certificateHash}</span>
                        </div>
                    </div>
                </div>
                <p style="margin-top: 15px;"><strong>Note:</strong> Save the Certificate ID for future verification.</p>
            </div>
        `;
    } else {
        resultContainer.innerHTML = `
            <div class="result-error">
                <h3><i class="fas fa-exclamation-triangle"></i> Error</h3>
                <p>${response.message || 'An error occurred while issuing the certificate.'}</p>
            </div>
        `;
    }
    
    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

// Verify certificate
async function verifyCertificate() {
    const certificateId = document.getElementById('certificate-id').value.trim();
    
    if (!certificateId) {
        showNotification('Please enter a certificate ID', 'error');
        return;
    }
    
    try {
        showLoading(true);
        const response = await verifyCertificateById(certificateId);
        
        if (response.success) {
            displayVerificationResult(response.data);
        } else {
            displayVerificationResult({ isValid: false, message: response.message });
        }
    } catch (error) {
        console.error('Error verifying certificate:', error);
        displayVerificationResult({ isValid: false, message: 'Network error. Please try again.' });
    } finally {
        showLoading(false);
    }
}

// Display verification result
function displayVerificationResult(data) {
    const resultContainer = document.getElementById('verify-result');
    
    if (data.isValid && data.certificate) {
        const cert = data.certificate;
        resultContainer.innerHTML = `
            <div class="result-success">
                <h3><i class="fas fa-shield-check"></i> Certificate Verified</h3>
                <p><strong>${data.message}</strong></p>
                <div class="certificate-display">
                    <div class="certificate-header">
                        <div class="certificate-id">${cert.certificateId}</div>
                        <div class="text-success">✓ Authentic</div>
                    </div>
                    <div class="certificate-details">
                        <div class="detail-item">
                            <span class="detail-label">Student Name</span>
                            <span class="detail-value">${cert.studentName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Institution</span>
                            <span class="detail-value">${cert.institutionName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Course</span>
                            <span class="detail-value">${cert.courseName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Grade</span>
                            <span class="detail-value">${cert.grade}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Issue Date</span>
                            <span class="detail-value">${cert.issueDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Issued On</span>
                            <span class="detail-value">${cert.issuedTimestamp}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        resultContainer.innerHTML = `
            <div class="result-error">
                <h3><i class="fas fa-shield-alt"></i> Verification Failed</h3>
                <p><strong>${data.message}</strong></p>
                <p>This certificate could not be verified. It may be:</p>
                <ul style="margin-top: 10px; margin-left: 20px;">
                    <li>Invalid or non-existent</li>
                    <li>Not issued through this blockchain system</li>
                    <li>Tampered with or forged</li>
                </ul>
            </div>
        `;
    }
    
    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

// Search functions
async function searchByStudent() {
    const studentName = document.getElementById('student-search').value.trim();
    
    if (!studentName) {
        showNotification('Please enter a student name', 'error');
        return;
    }
    
    try {
        showLoading(true);
        const response = await searchCertificatesByStudent(studentName);
        displaySearchResults(response.data, `Search results for student: "${studentName}"`);
    } catch (error) {
        console.error('Error searching certificates:', error);
        showNotification('Error searching certificates', 'error');
    } finally {
        showLoading(false);
    }
}

async function searchByInstitution() {
    const institutionName = document.getElementById('institution-search').value.trim();
    
    if (!institutionName) {
        showNotification('Please enter an institution name', 'error');
        return;
    }
    
    try {
        showLoading(true);
        const response = await searchCertificatesByInstitution(institutionName);
        displaySearchResults(response.data, `Search results for institution: "${institutionName}"`);
    } catch (error) {
        console.error('Error searching certificates:', error);
        showNotification('Error searching certificates', 'error');
    } finally {
        showLoading(false);
    }
}

async function getAllCertificates() {
    try {
        showLoading(true);
        const response = await fetchAllCertificates();
        displaySearchResults(response.data, 'All Certificates');
    } catch (error) {
        console.error('Error fetching certificates:', error);
        showNotification('Error fetching certificates', 'error');
    } finally {
        showLoading(false);
    }
}

// Display search results
function displaySearchResults(certificates, title) {
    const resultsContainer = document.getElementById('search-results');
    
    if (!certificates || certificates.length === 0) {
        resultsContainer.innerHTML = `
            <div class="result-info">
                <h3><i class="fas fa-info-circle"></i> No Results</h3>
                <p>No certificates found matching your search criteria.</p>
            </div>
        `;
    } else {
        let html = `<h3>${title} (${certificates.length} found)</h3>`;
        
        certificates.forEach(item => {
            const cert = item.certificate;
            html += `
                <div class="certificate-card">
                    <div class="certificate-card-header">
                        <span class="certificate-card-id">${cert.certificateId}</span>
                        <span class="certificate-status ${cert.isValid ? 'status-valid' : 'status-invalid'}">
                            ${cert.isValid ? '✓ Valid' : '✗ Invalid'}
                        </span>
                    </div>
                    <div class="certificate-details">
                        <div class="detail-item">
                            <span class="detail-label">Student</span>
                            <span class="detail-value">${cert.studentName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Institution</span>
                            <span class="detail-value">${cert.institutionName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Course</span>
                            <span class="detail-value">${cert.courseName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Grade</span>
                            <span class="detail-value">${cert.grade}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Issue Date</span>
                            <span class="detail-value">${cert.issueDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Block Index</span>
                            <span class="detail-value">#${item.blockIndex}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        resultsContainer.innerHTML = html;
    }
    
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// Search tab management
function showSearchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.search-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    // Show target tab
    const targetTab = document.getElementById(`search-${tabName}`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Clear search results
    document.getElementById('search-results').innerHTML = '';
}

// Load blockchain statistics
async function loadStats() {
    try {
        const response = await fetchBlockchainStats();
        
        if (response.success) {
            const stats = response.data;
            document.getElementById('total-blocks').textContent = stats.totalBlocks;
            document.getElementById('total-certificates').textContent = stats.totalCertificates;
            document.getElementById('total-institutions').textContent = stats.totalInstitutions;
            document.getElementById('chain-status').textContent = stats.isValid ? 'Valid' : 'Invalid';
            
            // Update status color
            const statusElement = document.getElementById('chain-status');
            statusElement.className = stats.isValid ? 'text-success' : 'text-danger';
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Validate blockchain
async function validateBlockchain() {
    try {
        showLoading(true);
        const response = await validateBlockchainIntegrity();
        
        if (response.success) {
            const isValid = response.data.isValid;
            showNotification(
                response.data.message,
                isValid ? 'success' : 'error'
            );
            
            // Refresh stats
            loadStats();
        }
    } catch (error) {
        console.error('Error validating blockchain:', error);
        showNotification('Error validating blockchain', 'error');
    } finally {
        showLoading(false);
    }
}

// Utility functions
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = show ? 'flex' : 'none';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles if not already added
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 90px;
                right: 20px;
                max-width: 400px;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                z-index: 10000;
                animation: slideInRight 0.3s ease;
            }
            .notification-success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
            .notification-error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
            .notification-info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
            .notification-content { display: flex; justify-content: space-between; align-items: center; }
            .notification-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: inherit; }
            @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        `;
        document.head.appendChild(styles);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Format hash for display
function formatHash(hash, length = 16) {
    if (!hash) return '';
    return hash.length > length ? `${hash.substring(0, length)}...` : hash;
}

// Format date for display
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy to clipboard', 'error');
    });
}
