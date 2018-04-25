const path = require('path');
const fs = require('fs');
const { URL } = require('url');

const PORT = parseInt(process.env.PORT || 1337);

const MP_API_URL = process.env.MP_API_URL ? (function (url) {
  try {
    return new URL(url);
  } catch (err) {
    console.error('Failed to parse MP_API_URL: ', err);
    process.exit(1);
  }
}(process.env.MP_API_URL)) : 'http://localhost:3000';

const CLIENT_DN = process.env.CLIENT_DN || 'CN=Test User tuser1, OU=HQ, O=n-ask, L=Fairfax, ST=Virginia, C=US';
const ISSUER_DN = process.env.ISSUER_DN || 'CN=n-ask, OU=HQ, O="n-ask, Inc.", L=Fairfax, ST=Virginia, C=US';

const CERT_FILE = 'cert.pem';
const KEY_FILE = 'key.pem';
const CA_FILE = 'ca.pem';

function cut(data, tag) {
  data = data.toString('utf-8');
  const header = `-----BEGIN ${tag}-----`;
  const footer = `-----END ${tag}-----`;
  let lines = data.split(/\s*[\r\n]+\s*/);
  const results = [];
  let result = [];
  for (let line of lines) {
    if (result.length > 0) {
      result.push(line);
      if (line === footer) {
        results.push(result.join("\r\n") + "\r\n");
        result = [];
      }
    } else if (result.length === 0 && line === header) {
      result.push(line);
    }
  }
  if (result.length > 0) {
    throw new Error(`Unterminated ${tag}`);
  }
  return results;
}

function loadCertificatePath(certPath, passphrase) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('loading proxy certificates from', certPath);
  }
  const files = fs.readdirSync(certPath);
  if (!files.includes(CERT_FILE)) {
    console.error(`Missing ${CERT_FILE} in ${certPath}`);
    process.exit(1);
  }
  if (!files.includes(KEY_FILE)) {
    console.error(`Missing ${KEY_FILE} in ${certPath}`);
    process.exit(1);
  }
  if (!files.includes(CA_FILE)) {
    console.error(`Missing ${CA_FILE} in ${certPath}`);
    process.exit(1);
  }
  try {
    let data = fs.readFileSync(path.join(certPath, CERT_FILE));
    const cert = cut(data, 'CERTIFICATE')[0];
    data = fs.readFileSync(path.join(certPath, KEY_FILE));
    const encryptedKey = cut(data, 'ENCRYPTED PRIVATE KEY')[0];
    const key = cut(data, 'PRIVATE KEY')[0];
    const ca = cut(fs.readFileSync(path.join(certPath, CA_FILE)), 'CERTIFICATE');
    if (encryptedKey) {
      if (!passphrase) {
        console.error(`Found encrypted key in ${path.join(certPath, KEY_FILE)}. Passphrase is required.`);
        process.exit(1);
      }
      return { key: encryptedKey, passphrase, cert, ca };
    } else {
      return { key, cert, ca };
    }
  } catch (err) {
    console.error(`Failed to read certificates in ${certPath}:`, err);
    process.exit(1);
  }
}

const HOME_CERT_PATH = (
  process.env.NODE_ENV !== 'production' &&
  fs.existsSync(path.join(process.env.HOME, '.certs')) &&
  fs.existsSync(path.join(process.env.HOME, '.certs', 'ca.pem')) &&
  fs.existsSync(path.join(process.env.HOME, '.certs', 'cert.pem')) &&
  fs.existsSync(path.join(process.env.HOME, '.certs', 'key.pem'))
) ? path.join(process.env.HOME, '.certs') : undefined;

const TLS = loadCertificatePath(
  process.env.CERT_PATH || HOME_CERT_PATH || path.join(__dirname, 'certs'),
  process.env.PASSPHRASE);

module.exports = {
  CLIENT_DN,
  ISSUER_DN,
  PORT,
  MP_API_URL,
  TLS
};
