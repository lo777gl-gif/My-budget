import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import { Period } from '../hooks/useBudget';

export default function Setup({ onSetup }: { onSetup: (name: string, amount: number, period: Period) => void }) {
  const [name, setName] = useState('Основной раздел');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<Period>('daily');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!isNaN(val) && val > 0 && name.trim()) {
      onSetup(name.trim(), val, period);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-8">
        <div className="text-center">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Ваш первый бюджет</h1>
          <p className="text-gray-500 mt-2">Давайте настроим ваш первый финансовый раздел</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название раздела
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Карманные, Зарплата..."
              className="w-full text-lg px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Сумма начисления (₸)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Например: 5000"
              className="w-full text-2xl px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              required
              min="1"
              step="any"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Период начисления
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`py-2 rounded-lg font-medium transition-colors text-sm ${
                    period === p 
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500' 
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                  }`}
                >
                  {p === 'daily' ? 'В день' : p === 'weekly' ? 'В неделю' : 'В месяц'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Стартовая сумма будет начислена немедленно.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors text-lg"
          >
            Начать
          </button>
        </form>
      </div>
    </div>
  );
}
