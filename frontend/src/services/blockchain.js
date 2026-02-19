import { ethers } from "ethers";

const CONTRACT_ABI = [
  "function grantAccess(address doctor) external",
  "function revokeAccess(address doctor) external",
  "function hasAccess(address patient, address doctor) view returns (bool)"
];

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";

function getEthereum() {
  if (!window.ethereum) {
    return null;
  }
  return window.ethereum;
}

async function getContractWithSigner() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Missing VITE_CONTRACT_ADDRESS in frontend environment.");
  }
  const ethereum = getEthereum();
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  return { contract, signer };
}

export async function connectWallet() {
  const ethereum = getEthereum();
  if (!ethereum) {
    throw new Error("MetaMask not installed. Install it from https://metamask.io");
  }
  const provider = new ethers.BrowserProvider(ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  const address = accounts?.[0];
  if (!address) {
    throw new Error("Wallet connection failed");
  }
  localStorage.setItem("medledger_wallet", address);
  return address;
}

export function getConnectedWallet() {
  return localStorage.getItem("medledger_wallet") || "";
}

export async function grantDoctorAccess(doctorAddress) {
  if (!ethers.isAddress(doctorAddress)) {
    throw new Error("Invalid doctor wallet address");
  }
  const { contract } = await getContractWithSigner();
  const tx = await contract.grantAccess(doctorAddress);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function revokeDoctorAccess(doctorAddress) {
  if (!ethers.isAddress(doctorAddress)) {
    throw new Error("Invalid doctor wallet address");
  }
  const { contract } = await getContractWithSigner();
  const tx = await contract.revokeAccess(doctorAddress);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function hasDoctorAccess(patientAddress, doctorAddress) {
  if (!ethers.isAddress(patientAddress) || !ethers.isAddress(doctorAddress)) {
    return false;
  }
  if (!CONTRACT_ADDRESS) {
    return false;
  }
  const ethereum = getEthereum();
  if (!ethereum) {
    return false;
  }
  const provider = new ethers.BrowserProvider(ethereum);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  const status = await contract.hasAccess(patientAddress, doctorAddress);
  return Boolean(status);
}
