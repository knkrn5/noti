import crypto from "crypto";

const ed = "HERE ADD THE ENCRYTED DATA U GOT FROM APP SINVO S3 ENDPOINT ";
const ek = "HERE ADD THE ENCRYTION KEY U GOT FOR THIS FILE: - soruces/app/printcart24/BuildConfig.java";

function decryptAES256GCM(encryptedHex: string, keyHex: string): string {
  const encrypted = Buffer.from(encryptedHex, "hex");
  const key = Buffer.from(keyHex, "hex");

  const iv = encrypted.subarray(0, 12);
  const authTag = encrypted.subarray(encrypted.length - 16);
  const cipherText = encrypted.subarray(12, encrypted.length - 16);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(cipherText),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

console.log(decryptAES256GCM(ed, ek));
