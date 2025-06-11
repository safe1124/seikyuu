import type { User, Bill } from './types'
import { STORAGE_KEYS } from './types'

export const generateUserCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getAllUsers = (): User[] => {
  const users = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
  return users ? JSON.parse(users) : [];
};

export const saveAllUsers = (users: User[]): void => {
  localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const saveCurrentUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const registerUser = (name: string, email: string): User => {
  const users = getAllUsers();
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    throw new Error('すでに登録されているメールアドレスです');
  }
  let userCode = generateUserCode();
  while (users.some(u => u.userCode === userCode)) {
    userCode = generateUserCode();
  }
  const newUser: User = {
    id: Date.now().toString(),
    name,
    email,
    userCode,
  };
  users.push(newUser);
  saveAllUsers(users);
  saveCurrentUser(newUser);
  return newUser;
};

export const loginUser = (email: string): User => {
  const users = getAllUsers();
  const user = users.find(u => u.email === email);
  if (!user) {
    throw new Error('登録されていないメールアドレスです');
  }
  saveCurrentUser(user);
  return user;
};

export const updateUser = (updatedUser: User): void => {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedUser };
    saveAllUsers(users);
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === updatedUser.id) {
      saveCurrentUser(users[index]);
    }
  }
};

export const findUserByCode = (userCode: string): User | null => {
  const users = getAllUsers();
  return users.find(u => u.userCode === userCode) || null;
};

export const setTargetCode = (userId: string, targetUserCode: string): boolean => {
  const currentUser = getAllUsers().find(u => u.id === userId);
  const targetUser = findUserByCode(targetUserCode);
  if (!currentUser || !targetUser || currentUser.id === targetUser.id) {
    return false;
  }
  updateUser({ ...currentUser, targetCode: targetUserCode });
  return true;
};

export const getBills = (): Bill[] => {
  const bills = localStorage.getItem(STORAGE_KEYS.BILLS);
  return bills ? JSON.parse(bills) : [];
};

export const saveBills = (bills: Bill[]): void => {
  localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
};

export const addBill = (bill: Omit<Bill, 'id'>): Bill => {
  const bills = getBills();
  const newBill: Bill = {
    ...bill,
    id: Date.now().toString(),
  };
  bills.unshift(newBill);
  saveBills(bills);
  return newBill;
};

export const updateBill = (billId: string, updates: Partial<Bill>): void => {
  const bills = getBills();
  const index = bills.findIndex(b => b.id === billId);
  if (index !== -1) {
    bills[index] = { ...bills[index], ...updates };
    saveBills(bills);
  }
};

export const getBillsByUser = (userId: string, type: 'from' | 'to'): Bill[] => {
  const bills = getBills();
  if (type === 'from') {
    return bills.filter(b => b.fromUserId === userId);
  } else {
    return bills.filter(b => b.toUserId === userId);
  }
};
