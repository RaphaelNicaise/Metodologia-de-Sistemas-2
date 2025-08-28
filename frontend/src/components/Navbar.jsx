import React from "react";
import '../styles/Navbar.css'
import { LuChartLine } from "react-icons/lu";
import { FaBell } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { FaWineBottle } from "react-icons/fa";
import { FaShop } from "react-icons/fa6";
import { FaUserTie } from "react-icons/fa6";
import { FaCalendarAlt } from "react-icons/fa";
import { FaCreditCard } from "react-icons/fa";

const Navbar = () => {
    return (
        <nav className="navbar-container">
            <section className="navbar-section">
                <h3 className="navbar-section-title">INFORMES</h3>
                <div className="navbar-links">
                    <a href="#dashboard" className="nav-link">
                        <LuChartLine className="nav-icon"/>
                        <span>Dashboard</span>
                    </a>
                    <a href="#notificaciones" className="nav-link">
                        <FaBell className="nav-icon"/>
                        <span>Notificaciones</span>
                    </a>
                </div>
            </section>
            
            <section className="navbar-section">
                <h3 className="navbar-section-title">VENTAS</h3>
                <div className="navbar-links">
                    <a href="#ventas" className="nav-link">
                        <FaShoppingCart className="nav-icon"/>
                        <span>Registrar ventas</span>
                    </a>
                </div>
            </section>
            
            <section className="navbar-section">
                <h3 className="navbar-section-title">STOCK</h3>
                <div className="navbar-links">
                    <a href="#productos" className="nav-link">
                        <FaWineBottle className="nav-icon"/>
                        <span>Productos</span>
                    </a>
                </div>
            </section>
            
            <section className="navbar-section">
                <h3 className="navbar-section-title">ADMINISTRACIÓN</h3>
                <div className="navbar-links">
                    <a href="#sucursales" className="nav-link">
                        <FaShop className="nav-icon"/>
                        <span>Sucursales</span>
                    </a>
                    <a href="#empleados" className="nav-link">
                        <FaUserTie className="nav-icon"/>
                        <span>Empleados</span>
                    </a>
                    <a href="#turnos" className="nav-link">
                        <FaCalendarAlt className="nav-icon"/>
                        <span>Turnos</span>
                    </a>
                    <a href="#pagos" className="nav-link">
                        <FaCreditCard className="nav-icon"/>
                        <span>Métodos de Pago</span>
                    </a>
                </div>
            </section>
        </nav>
    )
}

export default Navbar;