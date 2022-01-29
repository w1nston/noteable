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

export function updateNote(
  id: string,
  title: string,
  content: string
): Promise<void> {
  let index = tempNotes.findIndex((note) => note.id === id);
  console.log({ index, note: tempNotes[index], tempNotes, id, title, content });

  tempNotes[index].title = title;
  tempNotes[index].content = content;
  return Promise.resolve();
}

export function getNotes(): Promise<INote[]> {
  return Promise.resolve(tempNotes);
}
