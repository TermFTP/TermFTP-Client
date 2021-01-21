export function validateEmail(email: string): boolean {
  const mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return Boolean(email.match(mailformat));
}

// https://www.oreilly.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
export function validateIP(ip: string): boolean {
  const ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return Boolean(ip.trim().match(ipformat)) || ip.trim() === "localhost";
}
