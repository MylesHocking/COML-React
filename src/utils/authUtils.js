export const performLogout = (setUserId, setUserInfo, setIsLoggedIn, navigate, shouldNavigate = true) => {
    // Clear local storage
    localStorage.removeItem("googleToken");
    localStorage.removeItem("user_id");
    localStorage.removeItem("userInfo");

    // Reset user-related state
    setUserId(null);
    setUserInfo(null);
    setIsLoggedIn(false);

    // Conditional navigation
    if (shouldNavigate && navigate) {
        navigate('/');
    }
};
