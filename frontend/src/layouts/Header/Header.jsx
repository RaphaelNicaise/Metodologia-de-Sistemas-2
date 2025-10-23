import React from "react";
import '../../styles/Header.css';

const Header = () => {
    return (
        <div className="header-container">
            <div className="header-img-container">
                <img src="/scanner-logo.png" alt="SmartStock-Logo"/>
            </div>
            <div className="title-container">
                <h1>SmartStock</h1>
            </div>
        </div>
    )
}

export default Header