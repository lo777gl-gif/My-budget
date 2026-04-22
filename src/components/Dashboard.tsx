import React, { useState } from 'react';
import { AppState, Transaction, Period } from '../hooks/useBudget';
import { Plus, Minus, Settings, TrendingDown, TrendingUp, Calendar, ChevronDown, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AddTransactionModal from './AddTransactionModal';
import EditTransactionModal from './EditTransactionModal';
import AddWalletModal from './AddWalletModal';

type Props = {
  state: AppState;
  onAddTransaction: (amount: number, description: string, type: 'expense' | 'income') => void;
  onEditTransaction: (id: string, amount: number, description: string, type: 'expense' | 'allowance' | 'income') => void;
  onDeleteTransaction: (id: string) => void;
  onAddWallet: (name: string, amount: number, period: Period) => void;
  onSwitchWallet: (id: string) => void;
  onDeleteWallet: (id: string) => void;
  onReset: () => void;
};

export default function Dashboard({ 
  state, onAddTransaction, onEditTransaction, onDeleteTransaction, 
  onAddWallet, onSwitchWallet, onDeleteWallet, onReset 
}: Props) {
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<'expense' | 'income'>('expense');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);

  const activeWallet = state.wallets.find(w => w.id === state.activeWalletId);

  const openAddModal = (type: 'expense' | 'income') => {
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsEditModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPeriodLabel = (period: Period) => {
    if (period === 'daily') return 'В день';
    if (period === 'weekly') return 'В неделю';
    return 'В месяц';
  };

  if (!activeWallet) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header / Balance Card */}
      <div className="bg-blue-600 text-white pt-8 pb-8 px-6 rounded-b-[2.5rem] shadow-lg relative">
        
        {/* Wallet Switcher */}
        <div className="relative mb-6">
          <button 
            onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
            className="mx-auto flex items-center gap-1.5 bg-blue-500/50 hover:bg-blue-500/70 px-4 py-1.5 rounded-full transition-colors text-sm font-medium"
          >
            {activeWallet.name}
            <ChevronDown className={`w-4 h-4 transition-transform ${isWalletMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {isWalletMenuOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-20" onClick={() => setIsWalletMenuOpen(false)}
                />
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute top-10 left-1/2 -translate-x-1/2 w-64 bg-white rounded-2xl shadow-xl overflow-hidden z-30"
                >
                  <div className="max-h-60 overflow-y-auto">
                    {state.wallets.map(w => (
                      <button 
                        key={w.id} 
                        onClick={() => { onSwitchWallet(w.id); setIsWalletMenuOpen(false); }}
                        className={`w-full text-left px-4 py-3 flex justify-between items-center transition-colors ${
                          w.id === activeWallet.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="truncate pr-2">{w.name}</span>
                        <span className="text-xs font-normal opacity-70 flex-shrink-0">{formatMoney(w.balance)}</span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 p-2">
                    <button 
                      onClick={() => { setIsWalletMenuOpen(false); setIsAddWalletOpen(true); }}
                      className="w-full text-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-blue-600 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Новый раздел
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute top-6 right-6">
          <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          
          <AnimatePresence>
            {isSettingsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsSettingsOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl overflow-hidden z-20"
                >
                  {state.wallets.length > 1 && (
                    <button 
                      onClick={() => {
                        setIsSettingsOpen(false);
                        if(window.confirm(`Полностью удалить раздел "${activeWallet.name}" со всеми записями?`)) {
                          onDeleteWallet(activeWallet.id);
                        }
                      }}
                      className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 font-medium text-sm flex items-center gap-2 border-b border-gray-100"
                    >
                      <Trash2 className="w-4 h-4" />
                      Удалить этот раздел
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsResetModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 font-medium text-sm flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Полный сброс приложения
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        
        <div className="text-center mt-2">
          <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Баланс раздела</p>
          <h1 className={`text-5xl font-bold tracking-tight ${activeWallet.balance < 0 ? 'text-red-300' : 'text-white'}`}>
            {formatMoney(activeWallet.balance)}
          </h1>
          <p className="text-blue-100 text-sm mt-3 flex items-center justify-center gap-1">
            <Calendar className="w-4 h-4" />
            {getPeriodLabel(activeWallet.period)}: +{formatMoney(activeWallet.amount || 0)}
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-4 mt-8">
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-lg font-semibold text-gray-900">История ({activeWallet.name})</h2>
          <p className="text-xs text-gray-500">Нажмите для ред.</p>
        </div>
        
        <div className="space-y-3">
          {activeWallet.transactions.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Нет операций
            </div>
          ) : (
            activeWallet.transactions.map(tx => (
              <div 
                key={tx.id} 
                onClick={() => tx.type !== 'allowance' && openEditModal(tx)}
                className={`bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between ${
                  tx.type !== 'allowance' ? 'cursor-pointer hover:bg-gray-50 transition-colors active:scale-[0.98]' : 'opacity-90'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'expense' ? 'bg-red-100 text-red-600' : 
                    tx.type === 'income' ? 'bg-green-100 text-green-600' : 
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {tx.type === 'expense' ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0 pr-2">
                    <p className="font-medium text-gray-900 truncate">{tx.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
                  </div>
                </div>
                <div className={`font-semibold ml-auto whitespace-nowrap ${
                  tx.amount < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {tx.amount > 0 ? '+' : ''}{formatMoney(tx.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-4 px-6 max-w-md mx-auto z-10">
        <button
          onClick={() => openAddModal('expense')}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 font-medium transition-transform active:scale-95"
        >
          <Minus className="w-5 h-5" />
          Расход
        </button>
        <button
          onClick={() => openAddModal('income')}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 font-medium transition-transform active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Доход
        </button>
      </div>

      <AddTransactionModal
        isOpen={isAddModalOpen}
        type={addModalType}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(amount, desc) => {
          onAddTransaction(amount, desc, addModalType);
          setIsAddModalOpen(false);
        }}
      />

      <EditTransactionModal
        isOpen={isEditModalOpen}
        transaction={editingTransaction}
        onClose={() => setIsEditModalOpen(false)}
        onEdit={onEditTransaction}
        onDelete={onDeleteTransaction}
      />

      <AddWalletModal
        isOpen={isAddWalletOpen}
        onClose={() => setIsAddWalletOpen(false)}
        onAdd={onAddWallet}
      />

      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
              onClick={() => setIsResetModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Полный сброс?</h3>
              <p className="text-gray-500 mb-6">Вы потеряете <b>все</b> разделы и операции. Это действие необратимо.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    setIsResetModalOpen(false);
                    onReset();
                  }}
                  className="flex-1 px-4 py-3 text-white bg-red-500 hover:bg-red-600 rounded-xl font-medium transition-colors"
                >
                  Сбросить всё
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
