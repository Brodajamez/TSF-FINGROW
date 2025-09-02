import React, { useState, useMemo } from 'react';
import { Asset, Liability } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Modal from './ui/Modal';
import AssetLiabilityForm from './AssetLiabilityForm';
import AssetLiabilityList from './AssetLiabilityList';
import { formatCurrency } from '../utils/formatters';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface NetWorthPageProps {
  assets: Asset[];
  liabilities: Liability[];
  addAsset: (asset: Asset) => void;
  updateAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
  addLiability: (liability: Liability) => void;
  updateLiability: (liability: Liability) => void;
  deleteLiability: (id: string) => void;
  currency: string;
}

const generateId = () => '_' + Math.random().toString(36).substring(2, 11);

const COLORS = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#0369a1', '#075985', '#0c4a6e', '#082f49'];

const CustomPieChart = ({ data, currency }: { data: { name: string, value: number }[], currency: string }) => {
    if (data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-slate-400">No data to display.</div>
    }
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

const NetWorthPage: React.FC<NetWorthPageProps> = (props) => {
  const { assets, liabilities, currency } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Asset | Liability | null>(null);
  const [formType, setFormType] = useState<'asset' | 'liability'>('asset');

  const { totalAssets, totalLiabilities, netWorth, assetChartData, liabilityChartData } = useMemo(() => {
    const assetsTotal = assets.reduce((sum, a) => sum + a.amount, 0);
    const liabilitiesTotal = liabilities.reduce((sum, l) => sum + l.amount, 0);

    const groupByCategory = (items: (Asset | Liability)[]) => {
        const categoryMap: { [key: string]: number } = {};
        items.forEach(item => {
            categoryMap[item.category] = (categoryMap[item.category] || 0) + item.amount;
        });
        return Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    };
    
    return {
      totalAssets: assetsTotal,
      totalLiabilities: liabilitiesTotal,
      netWorth: assetsTotal - liabilitiesTotal,
      assetChartData: groupByCategory(assets),
      liabilityChartData: groupByCategory(liabilities),
    };
  }, [assets, liabilities]);

  const handleOpenModal = (type: 'asset' | 'liability', item: Asset | Liability | null = null) => {
    setFormType(type);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingItem(null), 300);
  };

  const handleFormSubmit = (formData: Omit<Asset | Liability, 'id'>) => {
    if (editingItem) {
        // Editing existing item
        if (formType === 'asset') {
            props.updateAsset({ ...formData, id: editingItem.id } as Asset);
        } else {
            props.updateLiability({ ...formData, id: editingItem.id } as Liability);
        }
    } else {
        // Adding new item
        if (formType === 'asset') {
            props.addAsset({ ...formData, id: generateId() } as Asset);
        } else {
            props.addLiability({ ...formData, id: generateId() } as Liability);
        }
    }
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Net Worth</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-400 to-green-600 text-white">
          <h3 className="text-lg font-semibold text-green-100">Total Assets</h3>
          <p className="text-4xl font-bold">{formatCurrency(totalAssets, currency)}</p>
        </Card>
        <Card className="bg-gradient-to-br from-red-400 to-red-600 text-white">
          <h3 className="text-lg font-semibold text-red-100">Total Liabilities</h3>
          <p className="text-4xl font-bold">{formatCurrency(totalLiabilities, currency)}</p>
        </Card>
        <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <h3 className="text-lg font-semibold text-primary-100">Net Worth</h3>
          <p className="text-4xl font-bold">{formatCurrency(netWorth, currency)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Assets</h2>
            <Button onClick={() => handleOpenModal('asset')}>Add Asset</Button>
          </div>
          <CustomPieChart data={assetChartData} currency={currency} />
          <div className="mt-4 border-t pt-2">
            <AssetLiabilityList 
                items={assets}
                onEdit={(item) => handleOpenModal('asset', item)}
                onDelete={props.deleteAsset}
                currency={currency}
                type="asset"
            />
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Liabilities</h2>
            <Button onClick={() => handleOpenModal('liability')}>Add Liability</Button>
          </div>
           <CustomPieChart data={liabilityChartData} currency={currency} />
          <div className="mt-4 border-t pt-2">
            <AssetLiabilityList 
                items={liabilities}
                onEdit={(item) => handleOpenModal('liability', item)}
                onDelete={props.deleteLiability}
                currency={currency}
                type="liability"
            />
          </div>
        </Card>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingItem ? `Edit ${formType}` : `Add New ${formType}`}
      >
        <AssetLiabilityForm 
          onSubmit={handleFormSubmit}
          onClose={handleCloseModal}
          itemToEdit={editingItem}
          type={formType}
        />
      </Modal>
    </div>
  );
};

export default NetWorthPage;
