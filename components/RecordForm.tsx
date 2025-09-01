import React, { useState, useEffect } from 'react';
import { Record } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';

interface RecordFormProps {
  onSubmit: (record: Omit<Record, 'id' | 'date'>) => void;
  onClose: () => void;
  recordToEdit?: Record | null;
}

const RecordForm: React.FC<RecordFormProps> = ({ onSubmit, onClose, recordToEdit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  useEffect(() => {
    if (recordToEdit) {
      setTitle(recordToEdit.title);
      setContent(recordToEdit.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [recordToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
        alert("Please add a title.");
        return;
    }

    onSubmit({ title, content });
  };
  
  const submitButtonText = recordToEdit ? 'Save Changes' : 'Add Record';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="title"
        label="Title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-slate-600 mb-1">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Add your notes here..."
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">{submitButtonText}</Button>
      </div>
    </form>
  );
};

export default RecordForm;