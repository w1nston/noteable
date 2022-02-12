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

  tempNotes[index].title = title;
  tempNotes[index].content = content;
  return Promise.resolve();
}

export function deleteNote(id: string): Promise<void> {
  let noteIndex = tempNotes.findIndex((note) => note.id === id);
  delete tempNotes[noteIndex];
  tempNotes = tempNotes.filter(Boolean);
  return Promise.resolve();
}

export function getNotes(): Promise<INote[]> {
  // TEMPORARY HACK BEFORE DB IS AT PLACE
  if (tempNotes.length === 0) {
    for (let i = 0; i < 4; ++i) {
      tempNotes.push({
        id: uuidv4(),
        title: `My note ${i + 1}`,
        content: 'Herro',
      });
    }
  }

  return Promise.resolve(tempNotes);
}
