import React, { useState, useEffect } from 'react'
import { Layout } from "antd";
import Navbar from './HeaderLayout.jsx';
const { Header, Content, Footer } = Layout;

const MainLayout = ({ children }) => {
    return (
        <Layout className="min-h-screen ">
            <Header
                className="fixed top-0 left-0 right-0 w-full z-50 !bg-transparent !p-0 h-16 flex items-center justify-center"
                style={{
                    backdropFilter: "blur(15px)",
                    transition: "all 0.3s ease-in-out"
                }}
            >
                <Navbar />
            </Header>
            <Content>
                {children}
            </Content>
            <Footer className="footer-layout">Footer</Footer>
        </Layout>
    )
}

export default MainLayout
