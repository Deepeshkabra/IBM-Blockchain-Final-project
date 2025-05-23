const crypto = require('crypto');

class Certificate {
    constructor(studentName, institutionName, courseName, grade, issueDate, certificateId = null) {
        this.certificateId = certificateId || this.generateCertificateId();
        this.studentName = studentName;
        this.institutionName = institutionName;
        this.courseName = courseName;
        this.grade = grade;
        this.issueDate = issueDate;
        this.timestamp = Date.now();
        this.certificateHash = this.calculateCertificateHash();
    }

    generateCertificateId() {
        return 'CERT-' + crypto.randomBytes(8).toString('hex').toUpperCase();
    }

    calculateCertificateHash() {
        return crypto.createHash('sha256')
            .update(this.certificateId + this.studentName + this.institutionName + 
                   this.courseName + this.grade + this.issueDate + this.timestamp)
            .digest('hex');
    }

    // Validate certificate data
    isValid() {
        if (!this.studentName || !this.institutionName || !this.courseName || !this.grade || !this.issueDate) {
            return false;
        }
        return this.certificateHash === this.calculateCertificateHash();
    }

    // Get certificate data for blockchain storage
    getCertificateData() {
        return {
            type: 'certificate',
            certificateId: this.certificateId,
            studentName: this.studentName,
            institutionName: this.institutionName,
            courseName: this.courseName,
            grade: this.grade,
            issueDate: this.issueDate,
            timestamp: this.timestamp,
            certificateHash: this.certificateHash
        };
    }

    // Get formatted certificate for display
    getFormattedCertificate() {
        return {
            certificateId: this.certificateId,
            studentName: this.studentName,
            institutionName: this.institutionName,
            courseName: this.courseName,
            grade: this.grade,
            issueDate: this.issueDate,
            issuedTimestamp: new Date(this.timestamp).toLocaleString(),
            certificateHash: this.certificateHash,
            isValid: this.isValid()
        };
    }

    // Static method to create certificate from data
    static fromData(data) {
        const cert = new Certificate(
            data.studentName,
            data.institutionName,
            data.courseName,
            data.grade,
            data.issueDate,
            data.certificateId
        );
        cert.timestamp = data.timestamp;
        cert.certificateHash = data.certificateHash;
        return cert;
    }
}

module.exports = Certificate;
