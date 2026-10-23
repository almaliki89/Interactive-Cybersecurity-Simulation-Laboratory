/**
 * Converts a dotted-decimal IPv4 address to its 32-bit unsigned integer representation.
 */
export const ipToLong = (ip: string): number => {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
};

/**
 * Checks if two IP addresses belong to the same subnet based on the CIDR prefix.
 */
export const isSameSubnet = (ip1: string, ip2: string, cidr: number): boolean => {
  if (cidr < 0 || cidr > 32) return false;
  if (cidr === 0) return true;
  
  const mask = (~0 << (32 - cidr)) >>> 0;
  const long1 = ipToLong(ip1);
  const long2 = ipToLong(ip2);
  
  return (long1 & mask) === (long2 & mask);
};
