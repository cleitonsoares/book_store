import { Service } from '@tsed/di';
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
//import md5 from "md5";
import crypto from "crypto-js";

@Service()
export class CryptService {
  generateJWT(data: any, expiresIn = "7d") {
    const jwtToken = jwt.sign(data, process.env.API_SECRET, { expiresIn });
    return jwtToken;
  }

  generateUUID() {
    return uuidv4();
  }

  decryptJWT(_jwt: string) {
    return jwt.decode(_jwt);
  }

  // generateMd5(text: string) {
  //   return md5(text);
  // }

  generataSHA256(text: string) {
    return crypto.SHA256(text).toString();
  } 
}