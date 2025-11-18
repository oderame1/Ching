// Auth utility for Seller App
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const isSeller = () => {
  const user = getStoredUser();
  return user?.role === 'seller';
};

export const requireSeller = (navigate) => {
  const user = getStoredUser();
  if (!user || user.role !== 'seller') {
    alert('Access denied. This page is for sellers only.');
    navigate('/');
    return false;
  }
  return true;
};

