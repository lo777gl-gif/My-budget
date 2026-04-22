import React from 'react';
import { useBudget } from './hooks/useBudget';
import Setup from './components/Setup';
import Dashboard from './components/Dashboard';

export default function App() {
  const { 
    state, addWallet, switchWallet, deleteWallet, 
    addTransaction, editTransaction, deleteTransaction, reset 
  } = useBudget();

  if (state.wallets.length === 0) {
    return <Setup onSetup={addWallet} />;
  }

  return (
    <Dashboard 
      state={state} 
      onAddTransaction={addTransaction} 
      onEditTransaction={editTransaction}
      onDeleteTransaction={deleteTransaction}
      onAddWallet={addWallet}
      onSwitchWallet={switchWallet}
      onDeleteWallet={deleteWallet}
      onReset={reset} 
    />
  );
}
