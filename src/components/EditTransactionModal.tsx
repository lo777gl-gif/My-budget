import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from '../hooks/useBudget';
import { Trash2 } from 'lucide-react';

type Props = {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onEdit: (id: string, amount: number, description: string, type: 'expense' | 'allowance' | 'income') => void;
  onDelete: (id: string) => void;
};

export default function EditTransactionModal({ isOpen, transaction, onClose, onEdit, onDelete }: Props) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'expense' | 'allowance' | 'income'>('expense');
  const [deleteClicks, setDeleteClicks] = useState(0);

  useEffect(() => {
    if (isOpen && transaction) {
      setAmount(Math.abs(transaction.amount).toString());
      setDescription(transaction.description);
      setType(transaction.type);
      setDeleteClicks(0);
    }
  }, [isOpen, transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;
    
    const val = parseFloat(amount);
    if (!isNaN(val) && val > 0) {
      onEdit(transaction.id, val, description.trim(), type);
      onClose();
    }
  };

  const handleDelete = () => {
    if (!transaction) return;
    if (deleteClicks === 0) {
      setDeleteClicks(1);
      setTimeout(() => setDeleteClicks(0), 3000);
    } else {
      onDelete(transaction.id);
      onClose();
    }
  };

  if (!transaction) return null;

  const isExpense = type === 'expense';
  const isAllowance = type === 'allowance';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={onClose} 
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white w-full max-w-md rounded-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className={`px-6 py-4 flex justify-between items-center ${isExpense ? 'bg-red-500' : isAllowance ? 'bg-blue-500' : 'bg-green-500'} text-white`}>
              <h3 className="text-xl font-semibold">
                Редактировать {isExpense ? 'расход' : isAllowance ? 'пополнение' : 'доход'}
              </h3>
              <button type="button" onClick={handleDelete} className={`p-2 rounded-full transition-colors ${deleteClicks > 0 ? 'bg-red-600 text-white' : 'bg-white/20 hover:bg-white/30'}`}>
                {deleteClicks > 0 ? <span className="text-xs font-bold px-2">Удалить?</span> : <Trash2 className="w-5 h-5" />}
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сумма (₸)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full text-3xl px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                  min="1"
                  step="any"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание (необязательно)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isExpense ? "Например: Обед" : "Например: Перевод"}
                  className="w-full text-lg px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              {!isAllowance && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип операции
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setType('expense')}
                      className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                        type === 'expense' ? 'bg-red-100 text-red-700 border-2 border-red-500' : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                      }`}
                    >
                      Расход
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('income')}
                      className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                        type === 'income' ? 'bg-green-100 text-green-700 border-2 border-green-500' : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                      }`}
                    >
                      Доход
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-3 text-white rounded-xl font-medium transition-colors ${
                    isExpense ? 'bg-red-500 hover:bg-red-600' : isAllowance ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  Сохранить
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
