export const getUserAuthToken = () => {
  return sessionStorage.getItem("token");
};

export const setUserAuthToken = (token: string) => {
  sessionStorage.setItem("token", token);
};

export const isUserAuthenticated = () => {
  const token = getUserAuthToken();
  return token !== null;
};
