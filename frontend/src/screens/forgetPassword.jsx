import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../axios';


const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpTimer, setOtpTimer] = useState(20);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (otpSent && otpTimer > 0) {
            timer = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
        } else if (otpTimer === 0) {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [otpSent, otpTimer]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/users/forgot-password', { email });
            toast.success('OTP has been sent to your email!');
            setOtpSent(true);
            setLoading(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error in sending OTP');
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/users/verify-otp', { email, otp });
            toast.success('OTP verified successfully!');
            setOtpVerified(true);
            setLoading(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }
        setLoading(true);
        try {
            await api.post('/users/reset-password', { email, newPassword, confirmPassword });
            toast.success('Password reset successful!');
            setLoading(false);
            setTimeout(() => navigate('/users/LoginScreen'));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error in resetting password');
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        setOtpTimer(10); 
        try {
            await api.post('/users/resend-otp', { email });
            toast.success('OTP resent successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error in resending OTP');
        }
    };
    

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={6}>
                    <h3>Forgot Password</h3>
                    <Form onSubmit={handleSendOtp}>
                        <Form.Group controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {!otpSent && (
                           <Button className="mt-3" variant="primary" type="submit" disabled={loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : 'Send OTP'}
                            </Button>
                        )}
                    </Form>

                    {otpSent && !otpVerified && (
                        <Form onSubmit={handleVerifyOtp}>
                            <Form.Group controlId="otp">
                                <Form.Label>Enter OTP</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Button className="mt-3" variant="success" type="submit" disabled={loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : 'Verify OTP'}
                            </Button>

                            {otpTimer === 0 ? (
                                <Button variant="link" onClick={resendOtp}>
                                    Resend OTP
                                </Button>
                            ) : (
                                <span>Resend OTP in {otpTimer}s</span>
                            )}
                        </Form>
                    )}

                    {otpVerified && (
                        <Form onSubmit={handlePasswordReset}>
                            <Form.Group controlId="newPassword">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="confirmPassword">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Button className="mt-3" variant="primary" type="submit" disabled={loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : 'Reset Password'}
                            </Button>
                        </Form>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default ForgotPasswordPage;
