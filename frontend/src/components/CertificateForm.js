import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    TextField,
    Button,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Snackbar,
    Alert
} from '@material-ui/core';

const validationSchema = Yup.object({
    studentName: Yup.string()
        .required('Student name is required')
        .min(2, 'Name must be at least 2 characters'),
    institutionName: Yup.string()
        .required('Institution name is required')
        .min(2, 'Institution name must be at least 2 characters'),
    courseName: Yup.string()
        .required('Course name is required')
        .min(2, 'Course name must be at least 2 characters'),
    grade: Yup.string()
        .required('Grade is required'),
    issueDate: Yup.date()
        .required('Issue date is required')
        .max(new Date(), 'Issue date cannot be in the future')
});

const CertificateForm = () => {
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

    const formik = useFormik({
        initialValues: {
            studentName: '',
            institutionName: '',
            courseName: '',
            grade: '',
            issueDate: new Date().toISOString().split('T')[0]
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:5000/api/certificates/issue', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(values)
                });

                const data = await response.json();

                if (data.success) {
                    setAlert({
                        open: true,
                        message: `Certificate issued successfully! ID: ${data.data.certificate.certificateId}`,
                        severity: 'success'
                    });
                    formik.resetForm();
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                setAlert({
                    open: true,
                    message: error.message || 'Error issuing certificate',
                    severity: 'error'
                });
            } finally {
                setLoading(false);
            }
        }
    });

    const handleCloseAlert = () => {
        setAlert({ ...alert, open: false });
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Issue New Certificate
            </Typography>
            <form onSubmit={formik.handleSubmit}>
                <Box mb={3}>
                    <TextField
                        fullWidth
                        id="studentName"
                        name="studentName"
                        label="Student Name"
                        value={formik.values.studentName}
                        onChange={formik.handleChange}
                        error={formik.touched.studentName && Boolean(formik.errors.studentName)}
                        helperText={formik.touched.studentName && formik.errors.studentName}
                    />
                </Box>
                <Box mb={3}>
                    <TextField
                        fullWidth
                        id="institutionName"
                        name="institutionName"
                        label="Institution Name"
                        value={formik.values.institutionName}
                        onChange={formik.handleChange}
                        error={formik.touched.institutionName && Boolean(formik.errors.institutionName)}
                        helperText={formik.touched.institutionName && formik.errors.institutionName}
                    />
                </Box>
                <Box mb={3}>
                    <TextField
                        fullWidth
                        id="courseName"
                        name="courseName"
                        label="Course Name"
                        value={formik.values.courseName}
                        onChange={formik.handleChange}
                        error={formik.touched.courseName && Boolean(formik.errors.courseName)}
                        helperText={formik.touched.courseName && formik.errors.courseName}
                    />
                </Box>
                <Box mb={3}>
                    <TextField
                        fullWidth
                        id="grade"
                        name="grade"
                        label="Grade"
                        value={formik.values.grade}
                        onChange={formik.handleChange}
                        error={formik.touched.grade && Boolean(formik.errors.grade)}
                        helperText={formik.touched.grade && formik.errors.grade}
                    />
                </Box>
                <Box mb={3}>
                    <TextField
                        fullWidth
                        id="issueDate"
                        name="issueDate"
                        label="Issue Date"
                        type="date"
                        value={formik.values.issueDate}
                        onChange={formik.handleChange}
                        error={formik.touched.issueDate && Boolean(formik.errors.issueDate)}
                        helperText={formik.touched.issueDate && formik.errors.issueDate}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Box>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                >
                    {loading ? 'Issuing Certificate...' : 'Issue Certificate'}
                </Button>
            </form>

            <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseAlert} severity={alert.severity}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default CertificateForm; 