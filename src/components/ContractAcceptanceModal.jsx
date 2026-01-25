import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function ContractAcceptanceModal({ issue, onAccept, onClose, isLoading }) {
  const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));

  const handleAccept = () => {
    onAccept(selectedDate);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Accept Responsibility</h2>
        
        <p className="text-sm text-slate-600 mb-6">
          Set a resolution deadline for this issue. You'll be accountable for resolving it by this date.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Resolution Deadline
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Accepting...' : 'Accept'}
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
          💡 This is a prototype smart contract simulation for public accountability.
        </p>
      </div>
    </div>
  );
}