import axios from "axios";
import FormData from "form-data";
import { env } from "../config/env.js";

export async function uploadToPinata(fileBuffer, originalName, mimeType) {
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
