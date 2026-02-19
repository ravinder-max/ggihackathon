import { ethers } from "ethers";
import { env } from "../config/env.js";
import crypto from "crypto";

const ABI = [
  "function addRecordHash(bytes32 recordHash) external",
  "function storeRecordHash(address patient, bytes32 recordHash) external",
  "function grantAccess(address doctor) external",
  "function revokeAccess(address doctor) external",
  "function hasAccess(address patient, address doctor) view returns (bool)"
];

const provider = new ethers.JsonRpcProvider(env.rpcUrl);

function isDemo() {
  return env.contractAddress === "0x0000000000000000000000000000000000000000";
}

function getServiceWallet() {
  if (!env.privateKey || !env.privateKey.startsWith("0x") || env.privateKey.length !== 66) {
    throw new Error("Invalid PRIVATE_KEY format. Expected 0x followed by 64 hex characters.");
  }
  return new ethers.Wallet(env.privateKey, provider);
}

function getServiceContract() {
  const wallet = getServiceWallet();
  return new ethers.Contract(env.contractAddress, ABI, wallet);
}

function getReadOnlyContract() {
  return new ethers.Contract(env.contractAddress, ABI, provider);
}

export async function writeRecordHashToChain({ patientAddress, ipfsHash }) {
  const chainHash = ethers.keccak256(ethers.toUtf8Bytes(ipfsHash));

  // Demo mode: Skip actual blockchain write
  if (isDemo()) {
    console.log(`[DEMO MODE] Record hash would be written to blockchain`);
    console.log(`[DEMO MODE] Patient: ${patientAddress}`);
    console.log(`[DEMO MODE] Chain Hash: ${chainHash}`);
    const demoTxHash = `0x${crypto.randomBytes(32).toString("hex")}`;
    return { chainHash, txHash: demoTxHash };
  }

  // Production mode: Write to blockchain
  const contract = getServiceContract();

  let tx;
  if (contract.interface.hasFunction("storeRecordHash(address,bytes32)")) {
    tx = await contract.storeRecordHash(patientAddress, chainHash);
  } else {
    tx = await contract.addRecordHash(chainHash);
  }

  const receipt = await tx.wait();
  return {
    chainHash,
    txHash: receipt.hash
  };
}

export async function checkDoctorAccessOnChain({ patientAddress, doctorAddress }) {
  if (!ethers.isAddress(patientAddress) || !ethers.isAddress(doctorAddress)) {
    return false;
  }

  if (isDemo()) {
    return false; // Demo mode: No on-chain access checks
  }

  try {
    const contract = getReadOnlyContract();
    const hasAccess = await contract.hasAccess(patientAddress, doctorAddress);
    return Boolean(hasAccess);
  } catch {
    return false;
  }
}

export async function grantDoctorAccessOnChain({ patientPrivateKey, doctorAddress }) {
  if (!patientPrivateKey) {
    throw new Error("patientPrivateKey is required");
  }
  if (!ethers.isAddress(doctorAddress)) {
    throw new Error("doctorAddress is invalid");
  }

  if (isDemo()) {
    console.log(`[DEMO MODE] Access grant would be written for doctor: ${doctorAddress}`);
    return { txHash: `0x${crypto.randomBytes(32).toString("hex")}` };
  }

  const patientWallet = new ethers.Wallet(patientPrivateKey, provider);
  const patientContract = new ethers.Contract(env.contractAddress, ABI, patientWallet);
  const tx = await patientContract.grantAccess(doctorAddress);
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
}

export async function revokeDoctorAccessOnChain({ patientPrivateKey, doctorAddress }) {
  if (!patientPrivateKey) {
    throw new Error("patientPrivateKey is required");
  }
  if (!ethers.isAddress(doctorAddress)) {
    throw new Error("doctorAddress is invalid");
  }

  const patientWallet = new ethers.Wallet(patientPrivateKey, provider);
  const patientContract = new ethers.Contract(env.contractAddress, ABI, patientWallet);
  const tx = await patientContract.revokeAccess(doctorAddress);
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
}
