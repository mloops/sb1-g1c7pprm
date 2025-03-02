import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Loader2, ChevronDown, Plus, Save, Trash2, Edit } from 'lucide-react';
import type { FinancialInputs } from '../types';
import { saveModel, updateModel } from '../utils/models';

interface SavedModel {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface ModelSelectorProps {
  currentModel: {
    name: string;
    description: string;
  };
  inputs: FinancialInputs;
  onLoadModel: (model: FinancialInputs) => void;
  isAuthenticated: boolean;
  currentModelId: string | null;
  onModelIdChange: (id: string | null) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  currentModel, 
  inputs, 
  onLoadModel,
  isAuthenticated,
  currentModelId,
  onModelIdChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState<SavedModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      fetchModels();
    }
  }, [isAuthenticated, isOpen]);

  const fetchModels = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('financial_models')
        .select('id, name, description, created_at, updated_at')
        .order('updated_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setModels(data || []);
      }
    } catch (err) {
      console.error('Error fetching models:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveModel = async () => {
    if (!isAuthenticated) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      let result;
      
      if (currentModelId) {
        // Update existing model
        result = await updateModel(currentModelId, {
          name: currentModel.name,
          description: currentModel.description,
          data: inputs
        });
        
        if (result.success) {
          setSaveMessage({
            text: 'Model updated successfully!',
            type: 'success'
          });
        } else {
          setSaveMessage({
            text: result.error || 'Failed to update model',
            type: 'error'
          });
        }
      } else {
        // Create new model
        result = await saveModel({
          name: currentModel.name,
          description: currentModel.description,
          data: inputs
        });
        
        if (result.success && result.id) {
          onModelIdChange(result.id);
          setSaveMessage({
            text: 'Model saved successfully!',
            type: 'success'
          });
        } else {
          setSaveMessage({
            text: result.error || 'Failed to save model',
            type: 'error'
          });
        }
      }
      
      fetchModels();
    } catch (error) {
      console.error('Error saving/updating model:', error);
      setSaveMessage({
        text: 'An unexpected error occurred',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    }
  };

  const handleLoadModel = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('financial_models')
        .select('data')
        .eq('id', id)
        .single();
      
      if (error) {
        setError(error.message);
      } else if (data) {
        onLoadModel(data.data as FinancialInputs);
        onModelIdChange(id); // Set the current model ID when loading
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Error loading model:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteModel = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this model?')) {
      setIsDeleting(id);
      
      try {
        const { error } = await supabase
          .from('financial_models')
          .delete()
          .eq('id', id);
        
        if (error) {
          setError(error.message);
        } else {
          // If we deleted the current model, reset the current model ID
          if (id === currentModelId) {
            onModelIdChange(null);
          }
          fetchModels();
        }
      } catch (err) {
        console.error('Error deleting model:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {isAuthenticated && (
          <button
            onClick={handleSaveModel}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-800 dark:bg-gray-700 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : currentModelId ? (
              <Edit className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {currentModelId ? 'Update Model' : 'Save Model'}
          </button>
        )}
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          My Models
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      
      {saveMessage && (
        <div className={`absolute right-0 mt-2 px-4 py-2 rounded-lg text-sm ${
          saveMessage.type === 'success' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {saveMessage.text}
        </div>
      )}
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            My Models
          </h3>
          
          {!isAuthenticated ? (
            <div className="text-center py-4">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Sign in to save and load models
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-600 dark:text-red-400 py-2">
              {error}
              <button 
                onClick={fetchModels}
                className="block mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600 dark:text-gray-400">
                No saved models yet
              </p>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {models.map(model => (
                <div 
                  key={model.id}
                  onClick={() => handleLoadModel(model.id)}
                  className={`p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer mb-2 transition-colors ${
                    currentModelId === model.id ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        {model.name}
                        {currentModelId === model.id && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded">
                            Current
                          </span>
                        )}
                      </h4>
                      {model.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {model.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Updated: {formatDate(model.updated_at)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteModel(model.id, e)}
                      className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                    >
                      {isDeleting === model.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};