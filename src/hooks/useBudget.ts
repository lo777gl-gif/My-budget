import { useState, useEffect } from 'react';

export type Period = 'daily' | 'weekly' | 'monthly';

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: 'expense' | 'allowance' | 'income';
};

export type Wallet = {
  id: string;
  name: string;
  amount: number;
  period: Period;
  balance: number;
  lastUpdateDate: string | null;
  transactions: Transaction[];
};

export type AppState = {
  wallets: Wallet[];
  activeWalletId: string | null;
};

const defaultState: AppState = {
  wallets: [],
  activeWalletId: null,
};

function calculateAccruals(lastUpdateStr: string, period: Period, amount: number) {
  if (!lastUpdateStr) return { addedAmount: 0, newDate: null, count: 0 };
  
  const lastDate = new Date(lastUpdateStr);
  lastDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let addedAmount = 0;
  let count = 0;
  let cursorDate = new Date(lastDate.getTime());

  let safetyCounter = 0;

  while (safetyCounter < 5000) {
    safetyCounter++;
    const nextDate = new Date(cursorDate.getTime());
    
    if (period === 'daily') {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (period === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (period === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    if (nextDate.getTime() <= today.getTime()) {
      addedAmount += amount;
      count++;
      cursorDate = new Date(nextDate.getTime());
    } else {
      break;
    }
  }

  return { 
    addedAmount, 
    newDate: count > 0 ? cursorDate.toISOString() : null, 
    count 
  };
}

export function useBudget() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('budget_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration from legacy state which had 'dailyAllowance' at top level
        if ('dailyAllowance' in parsed) {
          const legacyWallet: Wallet = {
            id: crypto.randomUUID(),
            name: 'Основной',
            amount: parsed.dailyAllowance || 0,
            period: 'daily',
            balance: parsed.balance || 0,
            lastUpdateDate: parsed.lastUpdateDate,
            transactions: parsed.transactions || []
          };
          return {
            wallets: [legacyWallet],
            activeWalletId: legacyWallet.id
          };
        }
        return parsed;
      } catch (e) {
        return defaultState;
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem('budget_state', JSON.stringify(state));
  }, [state]);

  // Check for auto-updates across all wallets
  useEffect(() => {
    if (state.wallets.length === 0) return;

    let stateChanged = false;
    const newWallets = state.wallets.map(wallet => {
      if (!wallet.lastUpdateDate) return wallet;

      const { addedAmount, newDate, count } = calculateAccruals(wallet.lastUpdateDate, wallet.period, wallet.amount);

      if (count > 0 && newDate) {
        stateChanged = true;
        
        let periodText = 'дн.';
        if (wallet.period === 'weekly') periodText = 'нед.';
        if (wallet.period === 'monthly') periodText = 'мес.';

        const newTransaction: Transaction = {
          id: crypto.randomUUID(),
          amount: addedAmount,
          description: `Авто-пополнение за ${count} ${periodText}`,
          date: new Date().toISOString(),
          type: 'allowance',
        };

        return {
          ...wallet,
          balance: wallet.balance + addedAmount,
          lastUpdateDate: newDate,
          transactions: [newTransaction, ...wallet.transactions],
        };
      }
      return wallet;
    });

    if (stateChanged) {
      setState(prev => ({ ...prev, wallets: newWallets }));
    }
  }, [state.wallets]);

  const addWallet = (name: string, amount: number, period: Period) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const initialTransaction: Transaction = {
      id: crypto.randomUUID(),
      amount: amount,
      description: 'Начальное пополнение',
      date: new Date().toISOString(),
      type: 'allowance',
    };

    const newWallet: Wallet = {
      id: crypto.randomUUID(),
      name,
      amount,
      period,
      balance: amount,
      lastUpdateDate: today.toISOString(),
      transactions: [initialTransaction]
    };

    setState(prev => ({
      wallets: [...prev.wallets, newWallet],
      activeWalletId: newWallet.id
    }));
  };

  const switchWallet = (id: string) => {
    setState(prev => ({ ...prev, activeWalletId: id }));
  };

  const deleteWallet = (id: string) => {
    setState(prev => {
      const remaining = prev.wallets.filter(w => w.id !== id);
      return {
        wallets: remaining,
        activeWalletId: remaining.length > 0 ? remaining[0].id : null
      };
    });
  };

  const addTransaction = (amount: number, description: string, type: 'expense' | 'income') => {
    setState(prev => {
      if (!prev.activeWalletId) return prev;
      
      const actualAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        amount: actualAmount,
        description: description || (type === 'expense' ? 'Расход' : 'Доход'),
        date: new Date().toISOString(),
        type,
      };

      const newWallets = prev.wallets.map(wallet => {
        if (wallet.id === prev.activeWalletId) {
          return {
            ...wallet,
            balance: wallet.balance + actualAmount,
            transactions: [newTransaction, ...wallet.transactions]
          };
        }
        return wallet;
      });

      return { ...prev, wallets: newWallets };
    });
  };

  const editTransaction = (id: string, amount: number, description: string, type: 'expense' | 'allowance' | 'income') => {
    setState(prev => {
      if (!prev.activeWalletId) return prev;

      const newWallets = prev.wallets.map(wallet => {
        if (wallet.id === prev.activeWalletId) {
          const txIndex = wallet.transactions.findIndex(t => t.id === id);
          if (txIndex === -1) return wallet;
          
          const oldTx = wallet.transactions[txIndex];
          if (oldTx.type === 'allowance') return wallet; // Security to prevent allowance edits
          
          const newTransactions = [...wallet.transactions];
          const actualAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
          
          newTransactions[txIndex] = {
            ...oldTx,
            amount: actualAmount,
            description: description || (type === 'expense' ? 'Расход' : type === 'income' ? 'Доход' : 'Пополнение'),
            type
          };
          
          const balanceDiff = actualAmount - oldTx.amount;
          return {
            ...wallet,
            balance: wallet.balance + balanceDiff,
            transactions: newTransactions
          };
        }
        return wallet;
      });

      return { ...prev, wallets: newWallets };
    });
  };

  const deleteTransaction = (id: string) => {
    setState(prev => {
      if (!prev.activeWalletId) return prev;

      const newWallets = prev.wallets.map(wallet => {
        if (wallet.id === prev.activeWalletId) {
          const tx = wallet.transactions.find(t => t.id === id);
          if (!tx || tx.type === 'allowance') return wallet;
          
          return {
            ...wallet,
            balance: wallet.balance - tx.amount,
            transactions: wallet.transactions.filter(t => t.id !== id)
          };
        }
        return wallet;
      });

      return { ...prev, wallets: newWallets };
    });
  };

  const reset = () => {
    setState(defaultState);
  };

  return { 
    state, 
    addWallet, 
    switchWallet, 
    deleteWallet, 
    addTransaction, 
    editTransaction, 
    deleteTransaction, 
    reset 
  };
}
