import { z, ZodObject, ZodString } from 'zod';

type Schema = {
  NoteId: ZodString;
  NoteContent: ZodString;
  NoteTitle: ZodString;
};

let NoteId: ZodString | null;
let NoteContent: ZodString | null;
let NoteTitle: ZodString | null;

export function getNoteSchema() {
  if (!NoteContent) {
    NoteContent = z.string();
  }

  if (!NoteId) {
    NoteId = z.string();
  }

  if (!NoteTitle) {
    NoteTitle = z.string();
  }

  return {
    NoteContent,
    NoteId,
    NoteTitle,
  };
}
