import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";
import { navigate as navAction } from "./slices/navigationSlice";
import type { AppPage } from "./slices/navigationSlice";
import { setUser, clearUser } from "./slices/userSlice";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);

export function useNavigation() {
  const dispatch    = useAppDispatch();
  const currentPage = useAppSelector((s) => s.navigation.currentPage);
  return {
    currentPage,
    navigate: (page: AppPage) => dispatch(navAction(page)),
  };
}

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
