import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebook, FaInstagram, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer
            style={{
                background: '#735DA5',
                color: 'white',
                padding: '20px 0',  
                marginTop: '40px', 
            }}
        >
            <Container>
                <Row>
                    {/* Contact Us Section */}
                    <Col md={4} className="text-center mb-4">
                        <h5 style={{ fontWeight: 'bold' }}>Contact Us</h5>
                        <p>Email: <a href="mailto:support@shortenerapp.com" style={{ color: 'white' }}>customersupport@stockimage.com</a></p>
                        <p>Phone: +1-123-456-7890</p>
                    </Col>

                    {/* Social Media Links */}
                    <Col md={4} className="text-center mb-4">
                        <h5 style={{ fontWeight: 'bold' }}>Follow Us</h5>
                        <a
                            href="https://www.facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: 'white',
                                margin: '0 15px',
                                fontSize: '24px',
                                transition: 'color 0.3s ease',
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#1F4E78'} // Hover effect
                            onMouseLeave={(e) => e.target.style.color = 'white'} // Hover effect
                        >
                            <FaFacebook />
                        </a>
                        <a
                            href="https://www.instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: 'white',
                                margin: '0 15px',
                                fontSize: '24px',
                                transition: 'color 0.3s ease',
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#1F4E78'}
                            onMouseLeave={(e) => e.target.style.color = 'white'}
                        >
                            <FaInstagram />
                        </a>
                    </Col>

                    {/* About Section */}
                    <Col md={4} className="text-center mb-4">
                        <h5 style={{ fontWeight: 'bold' }}>About</h5>
                        <p>
                        StockImage is an innovative platform that offers high-quality, royalty-free images to users and businesses alike. 
                        </p>
                    </Col>
                </Row>
                <hr style={{ background: 'white', margin: '20px 0' }} />
                <p className="text-center mb-0" style={{ fontSize: '14px' }}>© 2025 URL StockImage App. All Rights Reserved.</p>
            </Container>
        </footer>
    );
};

export default Footer;
