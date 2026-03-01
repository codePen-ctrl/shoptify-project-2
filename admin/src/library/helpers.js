export function isEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function generateId({
  startWith = null,
  length = 9,
  specialChar = true
} = {}) {

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special_chars = "!@#$%^&*";

  let pool = chars + numbers;

  if (specialChar) {
    pool += special_chars;
  }

  let id = "";

  for (let i = 0; i < length; i++) {
    id += pool[Math.floor(Math.random() * pool.length)];
  }

  if (startWith) {
    return startWith + id;
  }

  return id;
}

// import jwt from 'jsonwebtoken';

// export function generateToken({payload=null, secretKey=null ,expiresIn='1h'}={}){
//     if(!payload || typeof payload !== "object") throw new Error('Payload must be a non-empty object');
//     if(!secretKey || typeof secretKey !== "string") throw new Error('SecretKey must be a valid string');

//     return jwt.sign(payload, secretKey, {expiresIn: expiresIn});
// }