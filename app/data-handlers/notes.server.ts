import { v4 as uuidv4 } from 'uuid';

export type INote = {
  id: string;
  title: string;
  content: string; // TODO: or checkbox representation
};

// TODO: Temporary before database...
let tempNotes: INote[] = [];

export function createNote(title: string, content: string): Promise<void> {
  tempNotes.push({ id: uuidv4(), title, content });
  return Promise.resolve();
}

export function getNotes(): Promise<INote[]> {
  return Promise.resolve(tempNotes);
}
