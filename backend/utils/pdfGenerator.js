const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class CertificateGenerator {
    constructor() {
        this.doc = null;
    }

    async generateCertificate(certificate) {
        return new Promise((resolve, reject) => {
            try {
                // Create PDF document
                this.doc = new PDFDocument({
                    size: 'A4',
                    layout: 'landscape'
                });

                // Set up the PDF file path
                const fileName = `certificate-${certificate.certificateId}.pdf`;
                const filePath = path.join(__dirname, '../temp', fileName);

                // Create write stream
                const stream = fs.createWriteStream(filePath);
                this.doc.pipe(stream);

                // Add certificate content
                this._addHeader();
                this._addCertificateContent(certificate);
                this._addFooter(certificate);

                // Finalize PDF file
                this.doc.end();

                stream.on('finish', () => {
                    resolve(filePath);
                });

                stream.on('error', (error) => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    _addHeader() {
        this.doc
            .font('Helvetica-Bold')
            .fontSize(40)
            .text('CERTIFICATE OF COMPLETION', {
                align: 'center',
                y: 100
            })
            .moveDown(2);
    }

    _addCertificateContent(certificate) {
        // Add certificate text
        this.doc
            .font('Helvetica')
            .fontSize(20)
            .text('This is to certify that', {
                align: 'center'
            })
            .moveDown(0.5);

        // Add student name
        this.doc
            .font('Helvetica-Bold')
            .fontSize(30)
            .text(certificate.studentName, {
                align: 'center'
            })
            .moveDown(0.5);

        // Add course details
        this.doc
            .font('Helvetica')
            .fontSize(20)
            .text('has successfully completed the course', {
                align: 'center'
            })
            .moveDown(0.5);

        // Add course name
        this.doc
            .font('Helvetica-Bold')
            .fontSize(25)
            .text(certificate.courseName, {
                align: 'center'
            })
            .moveDown(0.5);

        // Add grade
        this.doc
            .font('Helvetica')
            .fontSize(20)
            .text(`with grade: ${certificate.grade}`, {
                align: 'center'
            })
            .moveDown(0.5);

        // Add institution name
        this.doc
            .font('Helvetica')
            .fontSize(20)
            .text(`from ${certificate.institutionName}`, {
                align: 'center'
            })
            .moveDown(2);
    }

    _addFooter(certificate) {
        // Add date
        this.doc
            .font('Helvetica')
            .fontSize(14)
            .text(`Issue Date: ${new Date(certificate.issueDate).toLocaleDateString()}`, {
                align: 'left',
                y: 500
            });

        // Add certificate ID
        this.doc
            .font('Helvetica')
            .fontSize(12)
            .text(`Certificate ID: ${certificate.certificateId}`, {
                align: 'right',
                y: 500
            });

        // Add verification text
        this.doc
            .font('Helvetica')
            .fontSize(10)
            .text('This certificate can be verified online at:', {
                align: 'center',
                y: 530
            })
            .text(`${process.env.FRONTEND_URL}/verify/${certificate.certificateId}`, {
                align: 'center',
                link: `${process.env.FRONTEND_URL}/verify/${certificate.certificateId}`
            });
    }
}

module.exports = new CertificateGenerator(); 