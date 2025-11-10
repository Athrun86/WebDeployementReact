/**
 * Utility functions for decoding and checking the expiration of a JWT (JSON Web Token).
 */

/**
 * Extracts the expiration time (in milliseconds) from a JWT.
 *
 * @param {string} token - The JWT string to decode.
 * @returns {number | null} - The expiration time in milliseconds since the Unix epoch, or null if invalid.
 */
export function getTokenExpMs(token: string): number | null {
  try {
    const parts = token.split('.'); // Split the token into its three parts (header, payload, signature)
    if (parts.length < 2) return null; // Ensure the token has at least two parts
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))); // Decode the payload
    if (!payload.exp) return null; // Return null if the payload does not contain an expiration time
    return payload.exp * 1000; // Convert the expiration time to milliseconds
  } catch {
    return null; // Return null if an error occurs during decoding
  }
}

/**
 * Checks if a JWT is expired.
 *
 * @param {string} token - The JWT string to check.
 * @returns {boolean} - True if the token is expired or invalid, false otherwise.
 */
export function isTokenExpired(token: string): boolean {
  const exp = getTokenExpMs(token); // Get the expiration time of the token
  if (!exp) return true; // Consider the token expired if the expiration time is invalid
  return Date.now() >= exp; // Compare the current time with the expiration time
}
