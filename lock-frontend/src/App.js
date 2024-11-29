import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";

// Add your contract ABI and address here
const contractABI = [
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
  },
  {
    "inputs": [],
    "name": "unlockTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256",
      },
    ],
    "stateMutability": "view",
    "type": "function",
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address payable",
        "name": "",
        "type": "address",
      },
    ],
    "stateMutability": "view",
    "type": "function",
  },
];

const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; // Replace with your deployed contract address

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [owner, setOwner] = useState("");
  const [unlockTime, setUnlockTime] = useState(0);
  const [isWithdrawable, setIsWithdrawable] = useState(false);
  const [balance, setBalance] = useState(0);
  const [userAccount, setUserAccount] = useState("");

  // Connect to Ethereum network
  const connectWallet = async () => {
    if (window.ethereum) {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await newProvider.getSigner();
      const userAddress = await signer.getAddress();
      setUserAccount(userAddress);
      setProvider(newProvider);

      const contractInstance = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      setContract(contractInstance);

      const ownerAddress = await contractInstance.owner();
      setOwner(ownerAddress);

      const unlockTimeValue = await contractInstance.unlockTime();
      setUnlockTime(unlockTimeValue.toString());
      const contractBalance = await newProvider.getBalance(contractAddress);
      setBalance(ethers.formatEther(contractBalance));
    } else {
      alert("Please install MetaMask!");
    }
  };

  // Handle withdraw action
  const handleWithdraw = async () => {
    if (!contract) return;

    try {
      const tx = await contract.withdraw();
      await tx.wait();
      alert("Transaction successful!");
      const newBalance = await provider.getBalance(contractAddress);
      setBalance(ethers.formatEther(newBalance));
    } catch (err) {
      console.error("Error withdrawing:", err);
      alert("Transaction failed!");
    }
  };

  useEffect(() => {
    if (userAccount && unlockTime > 0) {
      const currentTime = Math.floor(Date.now() / 1000);
      setIsWithdrawable(currentTime >= unlockTime);
    }
  }, [userAccount, unlockTime]);

  return (
    <div className="App">
      <h1>Lock Contract</h1>
      <button onClick={connectWallet}>Connect Wallet</button>
      {userAccount && (
        <div>
          <h2>Connected Account: {userAccount}</h2>
          <p>Owner: {owner}</p>
          <p>Unlock Time: {new Date(unlockTime * 1000).toLocaleString()}</p>
          <p>Contract Balance: {balance} ETH</p>
          {isWithdrawable && userAccount === owner ? (
            <button onClick={handleWithdraw}>Withdraw</button>
          ) : (
            <p>You cannot withdraw yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
