import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";

const algorithm = "aes-256-cbc";
const secretKey = process.env.SECRET_KEY;


if (Buffer.from(secretKey).length !== 32) {
  throw new Error("Invalid secretKey length. Must be 32 bytes.");
}

export const encryptMessage = (text) => {
  const iv = crypto.randomBytes(16); 
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  console.log("encrypted", encrypted);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

export const decryptMessage = (text) => {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  console.log("decrypted", decrypted.toString());
  return decrypted.toString();
};