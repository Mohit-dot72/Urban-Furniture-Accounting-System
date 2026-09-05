import axiosClient from './axiosClient';
import type { JournalEntry } from '../types';

export const getJournalEntries = () =>
  axiosClient.get<JournalEntry[]>('/journal-entries').then((r) => r.data);

export const getJournalEntry = (id: string) =>
  axiosClient.get<JournalEntry>(`/journal-entries/${id}`).then((r) => r.data);
