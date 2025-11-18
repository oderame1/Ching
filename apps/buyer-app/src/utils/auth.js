// Auth utility for Buyer App
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const isBuyer = () => {
  const user = getStoredUser();
  return user?.role === 'buyer';
};

export const requireBuyer = (navigate) => {
  const user = getStoredUser();
  if (!user || user.role !== 'buyer') {
    alert('Access denied. This page is for buyers only.');
    navigate('/');
    return false;
  }
  return true;
};

