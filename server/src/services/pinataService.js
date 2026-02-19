import axios from "axios";
import FormData from "form-data";
import { env } from "../config/env.js";
import crypto from "crypto";

export async function uploadToPinata(fileBuffer, originalName, mimeType) {
  // Demo mode: Use placeholder Pinata JWT to generate demo IPFS hash
  if (!env.pinataJwt || env.pinataJwt === "your_pinata_jwt_here") {
    // Generate deterministic demo IPFS hash from file content
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    const demoIpfsHash = `Qm${hash.substring(0, 44)}`; // Mock IPFS hash format
    
    console.log(`[DEMO MODE] File "${originalName}" would be uploaded to IPFS`);
    console.log(`[DEMO MODE] Generated demo IPFS hash: ${demoIpfsHash}`);
    
    return {
      ipfsHash: demoIpfsHash,
      ipfsUrl: `${env.pinataGatewayBase}/${demoIpfsHash}`
    };
  }

  // Production mode: Use real Pinata
  const form = new FormData();
  form.append("file", fileBuffer, {
    filename: originalName,
    contentType: mimeType
  });

  form.append(
    "pinataMetadata",
    JSON.stringify({
      name: originalName,
      keyvalues: {
        source: "medledger"
      }
    })
  );

  const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", form, {
    maxBodyLength: Infinity,
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${env.pinataJwt}`
    }
  });

  const { IpfsHash } = response.data;
  return {
    ipfsHash: IpfsHash,
    ipfsUrl: `${env.pinataGatewayBase}/${IpfsHash}`
  };
}
