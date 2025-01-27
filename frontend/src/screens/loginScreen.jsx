import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import api from '../axios';
import FormContainer from "../components/formContainer";
import { setCredentials } from "../slices/userAuthSlice";
import { useDispatch, useSelector } from "react-redux";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
 
  

  useEffect(() => {
    if (user) {
      navigate('/users/Homepage');
    }
  }, [user, navigate]);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/users/login', { email, password });
      const result = response.data;
      dispatch(setCredentials({ user: result.user, token: result.token })); 
      dispatch(setCredentials(result))
      navigate('/users/Homepage');
      toast.success("Login successful!");
    } catch (error) {
      console.error("Login error:", error); 
      toast.error(error.response?.data?.message || "Login failed");
    }
  };
  


  return (
      <FormContainer>
        <h2>Login</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="my-2" controlId="email">
            <Form.Label>Email:</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="my-2" controlId="password">
            <Form.Label>Password:</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Row className="py-3">
            <Col>
              <Link to="/users/ForgotPasswordScreen">Forgot Password?</Link>
            </Col>
          </Row>

            <Button
                type="submit"
                variant="primary"
                className="mt-3"
                style={{ backgroundColor: '#735DA5', borderColor: '#735DA5' }}
                >
                Login
          </Button>

          <Row className="py-3">
            <Col>
              Don’t have an account? <Link to="/users/RegisterScreen">Register</Link>
            </Col>
          </Row>
        </Form>

        <hr />
      </FormContainer>
  );
};

export default LoginPage;
