const Block = require('./block');
const Certificate = require('./certificate');

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2; // Mining difficulty
        this.pendingCertificates = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        const genesisData = {
            type: 'genesis',
            message: 'EduChain Genesis Block - Certificate Verification System',
            timestamp: Date.now()
        };
        return new Block(0, Date.now(), genesisData, "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // Add a certificate to the blockchain
    addCertificate(certificate) {
        if (!certificate.isValid()) {
            throw new Error('Invalid certificate data');
        }

        const block = new Block(
            this.chain.length,
            Date.now(),
            certificate.getCertificateData(),
            this.getLatestBlock().hash
        );

        block.mineBlock(this.difficulty);
        this.chain.push(block);
        
        console.log(`Certificate ${certificate.certificateId} added to blockchain`);
        return block;
    }

    // Get certificate by ID
    getCertificateById(certificateId) {
        for (let i = 1; i < this.chain.length; i++) {
            const block = this.chain[i];
            if (block.data.type === 'certificate' && block.data.certificateId === certificateId) {
                return {
                    certificate: Certificate.fromData(block.data),
                    block: block.getBlockInfo(),
                    blockIndex: i
                };
            }
        }
        return null;
    }

    // Search certificates by student name
    getCertificatesByStudent(studentName) {
        const certificates = [];
        for (let i = 1; i < this.chain.length; i++) {
            const block = this.chain[i];
            if (block.data.type === 'certificate' && 
                block.data.studentName.toLowerCase().includes(studentName.toLowerCase())) {
                certificates.push({
                    certificate: Certificate.fromData(block.data),
                    block: block.getBlockInfo(),
                    blockIndex: i
                });
            }
        }
        return certificates;
    }

    // Search certificates by institution
    getCertificatesByInstitution(institutionName) {
        const certificates = [];
        for (let i = 1; i < this.chain.length; i++) {
            const block = this.chain[i];
            if (block.data.type === 'certificate' && 
                block.data.institutionName.toLowerCase().includes(institutionName.toLowerCase())) {
                certificates.push({
                    certificate: Certificate.fromData(block.data),
                    block: block.getBlockInfo(),
                    blockIndex: i
                });
            }
        }
        return certificates;
    }

    // Get all certificates
    getAllCertificates() {
        const certificates = [];
        for (let i = 1; i < this.chain.length; i++) {
            const block = this.chain[i];
            if (block.data.type === 'certificate') {
                certificates.push({
                    certificate: Certificate.fromData(block.data),
                    block: block.getBlockInfo(),
                    blockIndex: i
                });
            }
        }
        return certificates;
    }

    // Validate the entire blockchain
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Check if current block is valid
            if (!currentBlock.isValid()) {
                console.log(`Invalid block at index ${i}`);
                return false;
            }

            // Check if current block points to previous block
            if (currentBlock.previousHash !== previousBlock.hash) {
                console.log(`Invalid previous hash at index ${i}`);
                return false;
            }
        }
        return true;
    }

    // Get blockchain statistics
    getBlockchainStats() {
        const totalBlocks = this.chain.length;
        const totalCertificates = this.getAllCertificates().length;
        const institutions = new Set();
        
        this.getAllCertificates().forEach(cert => {
            institutions.add(cert.certificate.institutionName);
        });

        return {
            totalBlocks,
            totalCertificates,
            totalInstitutions: institutions.size,
            difficulty: this.difficulty,
            isValid: this.isChainValid(),
            latestBlockHash: this.getLatestBlock().hash
        };
    }

    // Get the entire blockchain for visualization
    getFullChain() {
        return this.chain.map(block => block.getBlockInfo());
    }

    // Verify certificate authenticity
    verifyCertificate(certificateId) {
        const result = this.getCertificateById(certificateId);
        if (!result) {
            return {
                isValid: false,
                message: 'Certificate not found in blockchain',
                certificate: null
            };
        }

        const isValid = result.certificate.isValid();
        return {
            isValid,
            message: isValid ? 'Certificate is authentic and verified' : 'Certificate data has been tampered with',
            certificate: result.certificate.getFormattedCertificate(),
            blockInfo: result.block
        };
    }
}

module.exports = Blockchain;
