import type { User, Bill } from './types'
import { STORAGE_KEYS } from './types'
import { supabase } from './supabaseClient'

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

// Supabase에 사용자 등록
export const registerUserOnline = async (name: string, email: string) => {
  const userCode = generateUserCode();
  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email, user_code: userCode }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Supabase에서 사용자 조회(로그인)
export const loginUserOnline = async (email: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  if (error || !data) throw new Error('登録されていないメールアドレスです');
  return data;
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

// Supabase에 청구 데이터 추가
export const addBillOnline = async (bill: Omit<Bill, 'id'>) => {
  const { data, error } = await supabase
    .from('bills')
    .insert([{ ...bill }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Supabase에서 사용자별 청구 내역 조회
export const getBillsByUserOnline = async (userId: string, type: 'from' | 'to') => {
  let query = supabase.from('bills').select('*');
  if (type === 'from') {
    query = query.eq('fromUserId', userId);
  } else {
    query = query.eq('toUserId', userId);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const getBillsByUser = (userId: string, type: 'from' | 'to'): Bill[] => {
  const bills = getBills();
  if (type === 'from') {
    return bills.filter(b => b.fromUserId === userId);
  } else {
    return bills.filter(b => b.toUserId === userId);
  }
};
