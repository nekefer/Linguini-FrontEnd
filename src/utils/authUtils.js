import { fetchUserInfo } from "../api/auth";

/**
 * Check if user is authenticated by attempting to fetch user info
 * @returns {Promise<boolean>} True if user is authenticated, false otherwise
 */
export const checkAuthenticationStatus = async () => {
  try {
    await fetchUserInfo();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Handle OAuth redirect and update authentication state
 * @param {Function} updateUser - Function to update user state in auth context
 * @returns {Promise<void>}
 */
export const handleOAuthRedirect = async (updateUser) => {
  try {
    // Check if we have user cookies (set by OAuth redirect)
    const userEmail = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_email="))
      ?.split("=")[1];

    if (userEmail) {
      // User was redirected from OAuth, fetch their info
      const userData = await fetchUserInfo();
      updateUser(userData);

      // Clear the temporary cookie
      document.cookie =
        "user_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  } catch (error) {
    console.error("Error handling OAuth redirect:", error);
  }
};

/**
 * Get user type from cookies (new vs existing user)
 * @returns {string|null} 'new', 'existing', or null
 */
export const getUserTypeFromCookies = () => {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_type="))
      ?.split("=")[1] || null
  );
};

/**
 * Clear all authentication-related cookies
 */
export const clearAuthCookies = () => {
  const cookies = ["user_email", "user_type"];
  cookies.forEach((cookieName) => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
};
