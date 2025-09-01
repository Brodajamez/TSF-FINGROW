import React from 'react';
import Card from './ui/Card';
import Select from './ui/Select';

interface SettingsPageProps {
  currency: string;
  setCurrency: (currency: string) => void;
}

const SUPPORTED_CURRENCIES = [
    { code: 'NGN', name: 'Nigerian Naira' },
    { code: 'USD', name: 'United States Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
];

const SettingsPage: React.FC<SettingsPageProps> = ({ currency, setCurrency }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
      <Card title="Preferences">
        <div className="max-w-xs">
            <Select
                id="currency"
                label="Default Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
            >
                {SUPPORTED_CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                ))}
            </Select>
            <p className="text-sm text-slate-500 mt-2">This will change the currency display across the app.</p>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
