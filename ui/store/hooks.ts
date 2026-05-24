import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";
import { setUser, clearUser } from "./slices/userSlice";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);

export function useUser() {
  const dispatch = useAppDispatch();
  const email    = useAppSelector((s) => s.user.email);
  const phone    = useAppSelector((s) => s.user.phone);
  return {
    email,
    phone,
    isLoggedIn: !!(email || phone),
    login:  (data: { email?: string; phone?: string }) => dispatch(setUser(data)),
    logout: () => dispatch(clearUser()),
  };
}
