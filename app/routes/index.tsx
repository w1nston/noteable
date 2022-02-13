import { useState } from 'react';
import {
  ActionFunction,
  json,
  LinksFunction,
  LoaderFunction,
  useActionData,
  useFetcher,
  useFetchers,
  useLoaderData,
} from 'remix';
import { Dialog } from '@reach/dialog';
import { Alert } from '@reach/alert';
import dialogStyles from '@reach/dialog/styles.css';
import {
  createNote,
  updateNote,
  deleteNote,
  getNotes,
  INote,
} from '~/data-handlers/notes.server';
import notesStyles from '~/styles/notes.css';
import Spacer from '~/components/Spacer';
import { getNoteSchema } from '~/utils/network-typesafety';

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: dialogStyles },
    { rel: 'stylesheet', href: notesStyles },
  ];
};

type ActionData = {
  message?: string;
};

enum ButtonAction {
  Create = 'create',
  Delete = 'delete',
  Save = 'save',
}

function discardEmptyNoteRequest(data: ActionData) {
  return json(data, { status: 200 });
}

function validateContent(content: FormDataEntryValue | null): string {
  let NoteSchema = getNoteSchema();
  return NoteSchema.NoteContent.parse(content);
}

function validateId(id: FormDataEntryValue | null): string {
  let NoteSchema = getNoteSchema();
  return NoteSchema.NoteId.parse(id);
}

function validateTitle(title: FormDataEntryValue | null): string {
  let NoteSchema = getNoteSchema();
  return NoteSchema.NoteTitle.parse(title);
}

export const action: ActionFunction = async ({ request }) => {
  let body = await request.formData();

  let _action = body.get('_action');

  if (_action === ButtonAction.Create) {
    let content = validateContent(body.get('content'));
    let title = validateTitle(body.get('title'));

    if (title.length === 0 && content.length === 0) {
      return discardEmptyNoteRequest({ message: 'Discarded empty note' });
    }

    await createNote(title, content);
    return json({ created: true }, { status: 201 });
  }

  if (_action === ButtonAction.Delete) {
    let id = validateId(body.get('id')); // TODO: bad request status if no id

    await deleteNote(id);
    return json({ deleted: true }, { status: 200 });
  }

  if (_action === ButtonAction.Save) {
    // TODO: bug here?
    let content = validateContent(body.get('content'));
    let id = validateId(body.get('id'));
    let title = validateTitle(body.get('title'));

    await updateNote(id, title, content);
    return json({ updated: true }, { status: 200 });
  }

  // TODO: return bad request status

  // TODO: account for possible checkboxes...
};

export const loader: LoaderFunction = async () => {
  return await getNotes();
};

type NoteProps = {
  id: string;
  title: string;
  content: string;
  onClick: (note: INote) => void;
  // TODO: checkbox bro'
};

function Note({ id, title, content, onClick }: NoteProps) {
  function handleClick() {
    onClick({ id, title, content });
  }

  return (
    <button onClick={handleClick} className="note__container">
      <h2 className="note__title">{title}</h2>
      <p>{content}</p>
    </button>
  );
}

type NoteFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

function NewNoteForm({ isOpen, onClose }: NoteFormProps) {
  let fetcher = useFetcher();

  return (
    <Dialog isOpen={isOpen} onDismiss={onClose} aria-label="Add new note form">
      <button className="button__close" type="button" onClick={onClose}>
        {'<'}
      </button>
      <fetcher.Form className="note__form" method="post" onSubmit={onClose}>
        <input
          className="note__titleInput"
          type="text"
          name="title"
          placeholder="Title..."
        />
        <Spacer />
        <textarea
          className="note__notesInput"
          name="content"
          placeholder="Notes..."
        />
        {/* TODO: add checkboxes... */}
        <button
          name="_action"
          value={ButtonAction.Create}
          className="button__primary"
          type="submit"
        >
          Create
        </button>
      </fetcher.Form>
    </Dialog>
  );
}

type EditNoteFormProps = {
  isOpen: boolean;
  onClose: () => void;
  note: INote | null;
};

function EditNoteForm({ isOpen, onClose, note }: EditNoteFormProps) {
  let fetcher = useFetcher();

  return (
    <Dialog isOpen={isOpen} onDismiss={onClose} aria-label="Edit note form">
      <button
        className="button__close"
        aria-label="close note"
        type="button"
        onClick={onClose}
      >
        {`<`}
      </button>
      <fetcher.Form className="note__form" method="put" onSubmit={onClose}>
        <input type="hidden" name="id" value={note?.id} />
        <input
          className="note__titleInput"
          type="text"
          name="title"
          placeholder="Title..."
          defaultValue={note?.title}
        />
        <Spacer />
        <textarea
          className="note__notesInput"
          name="content"
          placeholder="Notes..."
          defaultValue={note?.content}
        />
        {/* TODO: add checkboxes... */}
        <button
          name="_action"
          value={ButtonAction.Save}
          className="button__primary"
          type="submit"
        >
          Save
        </button>
      </fetcher.Form>
      <fetcher.Form method="delete" onSubmit={onClose}>
        <input type="hidden" name="id" value={note?.id} />
        <button
          name="_action"
          value={ButtonAction.Delete}
          className="button__danger"
          type="submit"
        >
          Delete
        </button>
      </fetcher.Form>
    </Dialog>
  );
}

function optimisticPost(notes: INote[], newNote: INote): INote[] {
  return notes.concat([newNote]);
}

function optimisticPut(notes: INote[], updatedNote: INote): INote[] {
  let noteIndex = notes.findIndex((note) => note.id === updatedNote.id);
  if (noteIndex > -1) {
    notes[noteIndex] = updatedNote;
    return notes;
  }

  return notes;
}

function optimisticDelete(notes: INote[], noteId: string): INote[] {
  return notes.filter((note) => note.id !== noteId);
}

function useOptimisticUI(): INote[] {
  let notes = useLoaderData<INote[]>();
  let fetchers = useFetchers();

  if (fetchers.length > 0) {
    let [fetcher] = fetchers;

    if (fetcher.submission) {
      let { method, formData } = fetcher.submission;

      if (method.toLowerCase() === 'post') {
        let newNote: INote = Object.fromEntries(formData) as INote; // TODO: Maybe validation?
        return optimisticPost(notes, newNote);
      } else if (method.toLowerCase() === 'put') {
        let updatedNote: INote = Object.fromEntries(formData) as INote; // -"-
        return optimisticPut(notes, updatedNote);
      } else if (method.toLowerCase() === 'delete') {
        let noteId: string = formData.get('id') as string; // -"-
        return optimisticDelete(notes, noteId);
      }
    }
  }

  return notes;
}

export default function Index() {
  let [showNewNoteForm, setShowNewNoteForm] = useState<boolean>(false);
  let [editNote, setEditNote] = useState<INote | null>(null);
  let notes = useOptimisticUI();

  let actionData = useActionData<ActionData>();

  function handleCloseNewNoteForm() {
    setShowNewNoteForm(false);
  }

  function handleClickAddNewNote() {
    setShowNewNoteForm(true);
  }

  function handleClickNote(note: INote) {
    setEditNote(note);
  }

  function handleCloseEditNoteForm() {
    setEditNote(null);
  }

  return (
    <div className="index__container">
      <h1>Duly noted!</h1>
      <button className="note_addNoteButton" onClick={handleClickAddNewNote}>
        Add note
      </button>
      <div className="notes_container">
        <div className="notes__wrapper">
          {notes.map(({ id, title, content }) => (
            <Note
              key={id}
              id={id}
              title={title}
              content={content}
              onClick={handleClickNote}
            />
          ))}
        </div>
      </div>
      <NewNoteForm isOpen={showNewNoteForm} onClose={handleCloseNewNoteForm} />
      <EditNoteForm
        isOpen={editNote !== null}
        onClose={handleCloseEditNoteForm}
        note={editNote}
      />
      {actionData?.message ? <Alert>{actionData.message}</Alert> : null}
    </div>
  );
}
