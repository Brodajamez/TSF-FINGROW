import React, { useState, useMemo } from 'react';
import { Record } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Modal from './ui/Modal';
import RecordForm from './RecordForm';
import Input from './ui/Input';

interface RecordsPageProps {
  records: Record[];
  addRecord: (record: Record) => void;
  updateRecord: (record: Record) => void;
  deleteRecord: (id: string) => void;
}

const generateId = () => '_' + Math.random().toString(36).substring(2, 11);

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const RecordsPage: React.FC<RecordsPageProps> = ({ records, addRecord, updateRecord, deleteRecord }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = useMemo(() => {
    return records.filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [records, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: Record) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingRecord(null), 300);
  };

  const handleFormSubmit = (formData: Omit<Record, 'id' | 'date'>) => {
    const now = new Date().toISOString();
    if (editingRecord) {
      updateRecord({ ...formData, id: editingRecord.id, date: now });
    } else {
      addRecord({ ...formData, id: generateId(), date: now });
    }
    handleCloseModal();
  };
  
  const handleDelete = (id: string) => {
      if (window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
          deleteRecord(id);
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Financial Records</h1>
        <Button onClick={handleOpenAddModal}>Add New Record</Button>
      </div>

      <Card>
        <div className="max-w-md mb-6">
            <Input
                id="search-records"
                label="Search records"
                type="search"
                placeholder="Search by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        {records.length > 0 ? (
          filteredRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecords.map(record => (
                <Card key={record.id} className="flex flex-col">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{record.title}</h3>
                  <p className="text-xs text-slate-400 mb-3">Last updated: {formatDate(record.date)}</p>
                  <p className="text-sm text-slate-600 flex-grow whitespace-pre-wrap">{record.content}</p>
                  <div className="flex justify-end items-center space-x-2 mt-4 pt-4 border-t border-slate-100">
                    <button onClick={() => handleOpenEditModal(record)} className="text-slate-500 hover:text-primary-600 p-1" aria-label={`Edit record: ${record.title}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(record.id)} className="text-slate-500 hover:text-red-600 p-1" aria-label={`Delete record: ${record.title}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-12">No records match your search.</p>
          )
        ) : (
          <p className="text-slate-500 text-center py-12">You haven't saved any records yet. Click 'Add New Record' to start.</p>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingRecord ? "Edit Record" : "Add New Record"}>
        <RecordForm
          onSubmit={handleFormSubmit}
          onClose={handleCloseModal}
          recordToEdit={editingRecord}
        />
      </Modal>
    </div>
  );
};

export default RecordsPage;