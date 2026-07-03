import React, { useState } from 'react';
import { useBudget } from './hooks/useBudget';
import Setup from './components/Setup';
import Dashboard from './components/Dashboard';
import Calculator from './components/Calculator';
import { Wallet as WalletIcon, Calculator as CalculatorIcon } from 'lucide-react';

export default function App() {
  const { 
    state, addWallet, switchWallet, deleteWallet, 
    addTransaction, editTransaction, deleteTransaction, reset 
  } = useBudget();
  
  const [activeTab, setActiveTab] = useState<'budget' | 'calculator'>('budget');

  if (state.wallets.length === 0) {
    return <Setup onSetup={addWallet} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1">
        {activeTab === 'budget' ? (
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
        ) : (
          <Calculator />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center pt-2 pb-4 px-4 z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('budget')} 
          className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'budget' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <WalletIcon className="w-6 h-6" />
          <span className="text-xs font-medium mt-1">Бюджет</span>
        </button>
        <button 
          onClick={() => setActiveTab('calculator')} 
          className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'calculator' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <CalculatorIcon className="w-6 h-6" />
          <span className="text-xs font-medium mt-1">Калькулятор</span>
        </button>
      </div>
    </div>
  );
}
