import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type Props = {
  isOpen: boolean;
  type: 'expense' | 'income';
  onClose: () => void;
  onAdd: (amount: number, description: string) => void;
};

export default function AddTransactionModal({ isOpen, type, onClose, onAdd }: Props) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDescription('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!isNaN(val) && val > 0) {
      onAdd(val, description.trim());
    }
  };

  const isExpense = type === 'expense';

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
            <div className={`px-6 py-4 ${isExpense ? 'bg-red-500' : 'bg-green-500'} text-white`}>
              <h3 className="text-xl font-semibold">
                {isExpense ? 'Добавить расход' : 'Добавить доход'}
              </h3>
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
                    isExpense ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
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
