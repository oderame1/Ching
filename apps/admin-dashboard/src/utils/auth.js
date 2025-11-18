// Auth utility for Admin Dashboard
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const isAdmin = () => {
  const user = getStoredUser();
  return user?.role === 'admin';
};

export const requireAdmin = (navigate) => {
  const user = getStoredUser();
  if (!user || user.role !== 'admin') {
    alert('Access denied. This page is for administrators only.');
    navigate('/');
    return false;
  }
  return true;
};

