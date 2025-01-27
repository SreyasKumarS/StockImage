import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { Form, Button, Row, Col } from "react-bootstrap";
import { toast } from 'react-toastify';
import api from '../axios';
import { setCredentials } from "../slices/userAuthSlice";
import FormContainer from "../components/formContainer";

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [timer, setTimer] = useState(40);
  const [resendDisabled, setResendDisabled] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Timer for OTP Resend
  useEffect(() => {
    let interval = null;
    if (isOtpSent && resendDisabled) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (timer === 0) {
      setResendDisabled(false);
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, isOtpSent, resendDisabled]);

  const validateName = (name) => /^[A-Za-z\s]{3,}$/.test(name);
  const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/.test(password);

  const submitHandler = async (e) => {
    e.preventDefault();
  
    if (!isOtpSent) {
      if (!validateName(name)) {
        toast.error('Name must be at least 3 characters and contain only letters.');
      } else if (!validateEmail(email)) {
        toast.error('Invalid email format.');
      } else if (!validatePassword(password)) {
        toast.error('Password must be at least 6 characters, including 1 uppercase, 1 lowercase, and 1 number.');
      } else if (password !== confirmPassword) {
        toast.error('Passwords do not match.');
      } else {
        try {
          const formData = { name, email, password };
  
          // API POST request for registration
          await api.post('/users/register', formData);
          setIsOtpSent(true);  // OTP sent successfully
          setTimer(40);
          setResendDisabled(true); // Disable resend button
        } catch (error) {
          toast.error('Registration failed. Please try again.');
        }
      }
    } else if (isOtpSent && otp.trim() !== '') {
      try {
        // API POST request for OTP verification
        await api.post('/users/verify-otp', { email, otp });
        toast.success('Registration completed successfully!');
        navigate('/users/LoginScreen');
      } catch (error) {
        toast.error('Invalid OTP!');
      }
    } else {
      toast.error('Please enter the OTP.');
    }
  };
  

  const resendOtpHandler = async () => {
    try {
      // API POST request to resend OTP
      await api.post('/users/resend-otp', { email });
      setTimer(40);
      setResendDisabled(true);
    } catch (error) {
      toast.error('Failed to resend OTP');
    }
  };

  return (
      <FormContainer>
        <h1>{!isOtpSent ? 'Sign Up' : 'Enter OTP'}</h1>
        <Form onSubmit={submitHandler}>
          {!isOtpSent ? (
            <>
              <Form.Group className="my-2" controlId='name'>
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="my-2" controlId='email'>
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="my-2" controlId='password'>
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="my-2" controlId='confirmPassword'>
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" variant="primary" className="mt-3"   disabled={isOtpSent ? resendDisabled : false}
              >
                {isOtpSent ? 'Verify OTP' : 'Send OTP'}
              </Button>
            </>
          ) : (
            <>
              <Form.Group className="my-2" controlId='otp'>
                <Form.Label>OTP</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </Form.Group>
              <Row className="py-3">
                <Col>
                  <Button type="button" variant="link" onClick={resendOtpHandler} disabled={isOtpSent ? resendDisabled : false}>
                    Resend OTP {resendDisabled ? `(${timer})` : ''}
                  </Button>
                </Col>
              </Row>
              <Button type="submit" variant="primary" className="mt-3">
                {isOtpSent ? 'Verify OTP' : 'Send OTP'}
              </Button>
            </>
          )}
        </Form>
        <Row className="py-3">
          <Col>
            Already have an account? <Link to="/users/LoginScreen">Login</Link>
          </Col>
        </Row>
        <hr />
      </FormContainer>
  );
};

export default RegisterScreen;