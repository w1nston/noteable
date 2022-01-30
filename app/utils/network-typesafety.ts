import { z, ZodObject, ZodString } from 'zod';

type Schema = {
  NoteId: ZodObject<{ id: ZodString }>;
  NoteContent: ZodObject<{ content: ZodString }>;
  NoteTitle: ZodObject<{ title: ZodString }>;
};

let NoteId: ZodObject<{ id: ZodString }> | null;
let NoteContent: ZodObject<{ content: ZodString }> | null;
let NoteTitle: ZodObject<{ title: ZodString }> | null;

export function getNoteSchema() {
  if (!NoteContent) {
    NoteContent = z.object({
      content: z.string(),
    });
  }

  if (!NoteId) {
    NoteId = z.object({
      id: z.string(),
    });
  }

  if (!NoteTitle) {
    NoteTitle = z.object({
      title: z.string(),
    });
  }

  return {
    NoteContent,
    NoteId,
    NoteTitle,
  };
}
