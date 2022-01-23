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
  return Promise.resolve(
    tempNotes.concat([
      { id: uuidv4(), title: 'Note 1', content: 'Hey hopp' },
      { id: uuidv4(), title: 'Note 2', content: 'Hey hopp' },
      { id: uuidv4(), title: 'Note 3', content: 'Hey hopp' },
      { id: uuidv4(), title: 'Note 4', content: 'Hey hopp' },
      { id: uuidv4(), title: 'Note 5', content: 'Hey hopp' },
      { id: uuidv4(), title: 'Note 6', content: 'Hey hopp' },
      { id: uuidv4(), title: 'Note 7', content: 'Hey hopp' },
    ])
  );
}
