import type { User, Bill } from './types'
import { STORAGE_KEYS } from './types'
import { supabase } from './supabaseClient'

export const generateUserCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

// Supabase에서 user_code로 사용자 찾기
export const findUserByCodeOnline = async (userCode: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_code', userCode)
    .single();
  if (error || !data) return null;
  return data;
};

// Supabase에서 내 target_code 컬럼을 업데이트
export const setTargetCodeOnline = async (userId: string, targetCode: string) => {
  const { error } = await supabase
    .from('users')
    .update({ target_code: targetCode })
    .eq('id', userId);
  return !error;
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
  // Supabase 컬럼명에 맞게 key를 변환
  const dbBill = {
    fromuserid: bill.fromUserId,
    touserid: bill.toUserId,
    food: bill.food,
    price: bill.price,
    status: bill.status,
    date: bill.date,
    targetcode: bill.targetCode
  }
  const { data, error } = await supabase
    .from('bills')
    .insert([dbBill])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// Supabase에서 사용자별 청구 내역 조회
export const getBillsByUserOnline = async (userId: string, type: 'from' | 'to'): Promise<Bill[]> => {
  let query = supabase.from('bills').select('id, fromuserid, touserid, food, price, status, date, targetcode');
  if (type === 'from') {
    query = query.eq('fromuserid', userId);
  } else {
    query = query.eq('touserid', userId);
  }
  // id를 기준으로 내림차순 정렬하여 최신 청구가 먼저 오도록 합니다.
  query = query.order('id', { ascending: false });

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  if (!data) return [];

  // Transform snake_case to camelCase
  return data.map(bill => ({
    id: String(bill.id), // Ensure id is a string
    fromUserId: bill.fromuserid,
    toUserId: bill.touserid,
    food: bill.food,
    price: bill.price,
    status: bill.status,
    date: bill.date,
    targetCode: bill.targetcode,
  }));
};

// Supabase에서 청구 상태 업데이트
export const updateBillOnline = async (billId: string, updates: Partial<Bill>) => {
  const { error } = await supabase
    .from('bills')
    .update(updates)
    .eq('id', billId)
  return !error
}

// New function to update user details in Supabase
export const updateUserOnline = async (userId: string, updates: Partial<Pick<User, 'role' | 'name' | 'targetCode'>>) => {
  const dbUpdates: any = {};
  if (updates.role !== undefined) {
    dbUpdates.role = updates.role;
  }
  if (updates.name !== undefined) {
    dbUpdates.name = updates.name;
  }
  if (updates.targetCode !== undefined) {
    dbUpdates.target_code = updates.targetCode;
  }

  if (Object.keys(dbUpdates).length === 0) {
    console.warn("updateUserOnline called with no fields to update for user:", userId);
    const { data: existingUserData, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (fetchError) throw new Error(fetchError.message);
    if (!existingUserData) throw new Error('User not found when trying to fetch for no-op update.');

    return {
      data: {
        id: existingUserData.id,
        name: existingUserData.name,
        email: existingUserData.email,
        userCode: existingUserData.user_code,
        targetCode: existingUserData.target_code,
        role: existingUserData.role,
      } as User,
      error: null
    };
  }

  const { data, error } = await supabase
    .from('users')
    .update(dbUpdates)
    .eq('id', userId)
    .select('*') 
    .single();

  if (error) {
    console.error('Error updating user online:', error.message);
    throw new Error(`Failed to update user: ${error.message}`);
  }
  
  if (data) {
    return {
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        userCode: data.user_code,
        targetCode: data.target_code,
        role: data.role,
      } as User,
      error: null
    };
  }
  throw new Error('User update seemed to succeed but no data was returned.'); 
};
