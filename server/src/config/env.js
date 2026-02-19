import dotenv from "dotenv";

dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: required("MONGO_URI"),
  pinataJwt: required("PINATA_JWT"),
  pinataGatewayBase: process.env.PINATA_GATEWAY_BASE || "https://gateway.pinata.cloud/ipfs",
  rpcUrl: required("RPC_URL"),
  privateKey: required("PRIVATE_KEY"),
  contractAddress: required("CONTRACT_ADDRESS"),
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://127.0.0.1:8000"
};
