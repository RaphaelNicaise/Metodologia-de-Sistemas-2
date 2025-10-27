import { Navbar, Image } from 'react-bootstrap';
import './Header.css';

const Header = () => {
    return (

        <Navbar className="app-header border-bottom border-2 border-dark" variant="dark">
            
            <Navbar.Brand href="#home" className="d-flex align-items-center">

                <Image
                    src="/scanner-logo.png"
                    alt="SmartStock-Logo"
                    style={{ width: '70px', height: '70px' }}
                    className="me-3"
                />
                <span className="app-header-title h1 mb-0">
                    SmartStock
                </span>
            </Navbar.Brand>
        </Navbar>
    );
}

export default Header;