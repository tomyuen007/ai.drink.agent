import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@wine_users";

export interface StoredUser {
  email:    string;
  phone:    string;
  password: string;
}

export type RegisterResult = "ok" | "exists";

export class UserStore {
  private static async load(): Promise<StoredUser[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as StoredUser[]) : [];
    } catch {
      return [];
    }
  }

  private static async save(users: StoredUser[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  // Find by email (case-insensitive) or exact phone
  static async findByIdentifier(identifier: string): Promise<StoredUser | null> {
    const users = await this.load();
    const id = identifier.trim();
    const idLower = id.toLowerCase();
    return (
      users.find(
        (u) =>
          (u.email && u.email.toLowerCase() === idLower) ||
          (u.phone && u.phone === id),
      ) ?? null
    );
  }

  // "exists" if either email or phone is already registered
  static async register(
    email: string,
    phone: string,
    password: string,
  ): Promise<RegisterResult> {
    const users    = await this.load();
    const eTrimmed = email.trim().toLowerCase();
    const pTrimmed = phone.trim();
    const exists   = users.some(
      (u) =>
        (eTrimmed && u.email.toLowerCase() === eTrimmed) ||
        (pTrimmed && u.phone === pTrimmed),
    );
    if (exists) return "exists";
    users.push({ email: email.trim(), phone: pTrimmed, password });
    await this.save(users);
    return "ok";
  }

  // true if identifier + password match a stored user
  static async verify(identifier: string, password: string): Promise<boolean> {
    const user = await this.findByIdentifier(identifier);
    return user !== null && user.password === password;
  }
}
