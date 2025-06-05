import crypto from "crypto";

const generateSecretKey = () => {
  return crypto.randomBytes(64).toString("hex");
};

console.log(generateSecretKey());
