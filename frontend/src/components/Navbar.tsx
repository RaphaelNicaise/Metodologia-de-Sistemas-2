import { Nav } from 'react-bootstrap';
import './Navbar.css';

import { LuChartLine } from "react-icons/lu";
import { FaBell, FaShoppingCart, FaWineBottle, FaCreditCard, FaCalendarAlt, FaUserTie, FaCashRegister, FaMoneyBillWave } from "react-icons/fa";
import { FaShop } from "react-icons/fa6";

const Navbar = () => {
    return (
        <Nav as="nav" className="app-sidebar vh-100 bg-light border-end flex-column">
            
            <div className="app-sidebar-section">

                <h3 className="app-sidebar-title text-muted text-uppercase fw-bold">
                    INFORMES
                </h3>
                <div className="app-sidebar-links">

                    <Nav.Link href="/dashboard" className="app-nav-link">
                        <LuChartLine className="app-nav-icon"/>
                        <span>Dashboard</span>
                    </Nav.Link>
                </div>
            </div>
            
            <div className="app-sidebar-section">
                <h3 className="app-sidebar-title text-muted text-uppercase fw-bold">
                    VENTAS
                </h3>
                <div className="app-sidebar-links">
                    <Nav.Link href="/ventas" className="app-nav-link">
                        <FaShoppingCart className="app-nav-icon"/>
                        <span>Registrar ventas</span>
                    </Nav.Link>
                </div>
            </div>

            <div className="app-sidebar-section">
                <h3 className="app-sidebar-title text-muted text-uppercase fw-bold">
                    STOCK
                </h3>
                <div className="app-sidebar-links">
                    <Nav.Link href="/productos" className="app-nav-link">
                        <FaWineBottle className="app-nav-icon"/>
                        <span>Productos</span>
                    </Nav.Link>
                    <Nav.Link href="/proveedores" className="app-nav-link">
                        <FaShop className="app-nav-icon"/>
                        <span>Proveedores</span>
                    </Nav.Link>
                </div>
            </div>

            <div className="app-sidebar-section">
                <h3 className="app-sidebar-title text-muted text-uppercase fw-bold">
                    ADMINISTRACIÓN
                </h3>
                <div className="app-sidebar-links">
                    <Nav.Link href="/gastos" className="app-nav-link">
                        <FaMoneyBillWave className="app-nav-icon"/>
                        <span>Gastos</span>
                    </Nav.Link>
                    <Nav.Link href="/cierre-caja" className="app-nav-link">
                        <FaCashRegister className="app-nav-icon"/>
                        <span>Cierre de Caja</span>
                    </Nav.Link>

                </div>
            </div>
        </Nav>
    );
}

export default Navbar;