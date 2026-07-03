import React, { useState, useEffect } from 'react';
import { TrendingUp, Calculator as CalcIcon, Percent, Info } from 'lucide-react';

export default function Calculator() {
  const [initial, setInitial] = useState('100000');
  const [monthly, setMonthly] = useState('20000');
  const [rate, setRate] = useState('14');
  const [years, setYears] = useState('5');

  const initialNum = parseFloat(initial) || 0;
  const monthlyNum = parseFloat(monthly) || 0;
  const rateNum = parseFloat(rate) || 0;
  const yearsNum = parseFloat(years) || 0;

  const r = rateNum / 100;
  const n = 12;
  const t = yearsNum;

  let totalAmount = 0;
  let totalInvested = initialNum + (monthlyNum * 12 * t);

  if (r === 0) {
    totalAmount = totalInvested;
  } else {
    // Compound interest formula with regular monthly deposits
    totalAmount = initialNum * Math.pow(1 + r/n, n*t) + monthlyNum * (Math.pow(1 + r/n, n*t) - 1) / (r/n);
  }

  const totalInterest = Math.max(0, totalAmount - totalInvested);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fetch inflation rates from API
  const [inflationRates, setInflationRates] = useState({
    kz: 8.5,
    ru: 8.0,
    us: 3.3,
    month: 'Загрузка...'
  });

  useEffect(() => {
    fetch('/api/inflation')
      .then(r => r.json())
      .then(data => {
        setInflationRates(data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 px-4 pt-8">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Инвестиции</h2>
        </div>

        {/* Output Card */}
        <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg">
          <p className="text-blue-100 text-sm font-medium mb-1">Итоговая сумма</p>
          <h3 className="text-4xl font-bold tracking-tight mb-4">{formatMoney(totalAmount)}</h3>
          
          <div className="grid grid-cols-2 gap-4 border-t border-blue-500/50 pt-4 mt-4">
            <div>
              <p className="text-blue-200 text-xs mb-1">Вложено всего</p>
              <p className="font-semibold">{formatMoney(totalInvested)}</p>
            </div>
            <div>
              <p className="text-blue-200 text-xs mb-1">Доход (%)</p>
              <p className="font-semibold text-green-300">+{formatMoney(totalInterest)}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Начальная сумма (₸)</label>
            <input
              type="number"
              value={initial}
              onChange={(e) => setInitial(e.target.value)}
              className="w-full text-lg px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ежемесячное пополнение (₸)</label>
            <input
              type="number"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
              className="w-full text-lg px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              min="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ставка (%)</label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full text-lg px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Срок (лет)</label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full text-lg px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Inflation Stats */}
        <div className="bg-white p-6 rounded-3xl shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-gray-400" />
            <h4 className="text-gray-800 font-semibold">Ставки инфляции</h4>
          </div>
          <p className="text-xs text-gray-500 mb-4 capitalize">Обновлено: {inflationRates.month}</p>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="font-medium text-gray-700">🇰🇿 Казахстан</span>
              <span className="font-bold text-red-500">{inflationRates.kz}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="font-medium text-gray-700">🇷🇺 Россия</span>
              <span className="font-bold text-red-500">{inflationRates.ru}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="font-medium text-gray-700">🇺🇸 США</span>
              <span className="font-bold text-red-500">{inflationRates.us}%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
