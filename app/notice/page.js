"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";

// Styled Components for the layout
const Container = styled.div`
  background-color: black;
  color: white;
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`;

const Header = styled.header`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 20px;
  background-color: black;
`;

const Logo = styled.img`
  height: 40px;
  cursor: pointer;
`;

const ContentImage = styled.img`
  width: 100%;
  object-fit: contain;
  margin: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 0;
`;

const Button = styled.button`
  width: 210px;
  height: 55px;
  background-color: black;
  color: white;
  border: 1px solid white;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  margin: 0 auto;

  &:hover {
    background-color: white;
    color: black;
  }
`;

const FooterText = styled.p`
  font-size: 18px;
  font-weight: light;
  font-family: Arial, sans-serif;
  color: white;
  opacity: 0.8;
  margin-top: 60px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

export default function DApp() {
  

  return (
    <Container>
      {/* 네비바 */}
      <Header>
        <Link href="/">
          <Logo src="/bugscoin.png" alt="Logo" />
        </Link>
      </Header>

      {/* 상단 이미지 */}
      <ContentImage src="/notice.png" alt="Notice Image" />

      

      {/* 하단 문구 */}
      <FooterText>© 2024 BugsCoin All rights reserved.</FooterText>
    </Container>
  );
}
