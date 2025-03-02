import { supabase } from './supabase';
import type { FinancialInputs } from '../types';

export interface SavedModel {
  id: string;
  name: string;
  description: string | null;
  data: FinancialInputs;
  created_at: string;
  updated_at: string;
}

export async function saveModel(model: { 
  name: string; 
  description: string; 
  data: FinancialInputs;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'You must be logged in to save models' };
    }
    
    const { data, error } = await supabase
      .from('financial_models')
      .insert({
        user_id: user.id,
        name: model.name,
        description: model.description,
        data: model.data
      })
      .select('id')
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Error saving model:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function updateModel(id: string, model: {
  name: string;
  description: string;
  data: FinancialInputs;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'You must be logged in to update models' };
    }
    
    const { error } = await supabase
      .from('financial_models')
      .update({
        name: model.name,
        description: model.description,
        data: model.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating model:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getModel(id: string): Promise<{ 
  model?: SavedModel; 
  error?: string 
}> {
  try {
    const { data, error } = await supabase
      .from('financial_models')
      .select('id, name, description, data, created_at, updated_at')
      .eq('id', id)
      .single();
    
    if (error) {
      return { error: error.message };
    }
    
    return { model: data as SavedModel };
  } catch (error) {
    console.error('Error getting model:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function getModels(): Promise<{ 
  models: SavedModel[]; 
  error?: string 
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { models: [], error: 'You must be logged in to view models' };
    }
    
    const { data, error } = await supabase
      .from('financial_models')
      .select('id, name, description, data, created_at, updated_at')
      .order('updated_at', { ascending: false });
    
    if (error) {
      return { models: [], error: error.message };
    }
    
    return { models: data as SavedModel[] };
  } catch (error) {
    console.error('Error getting models:', error);
    return { models: [], error: 'An unexpected error occurred' };
  }
}

export async function deleteModel(id: string): Promise<{ 
  success: boolean; 
  error?: string 
}> {
  try {
    const { error } = await supabase
      .from('financial_models')
      .delete()
      .eq('id', id);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting model:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}