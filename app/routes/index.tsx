import { useState } from 'react';
import {
  ActionFunction,
  Form,
  LinksFunction,
  LoaderFunction,
  redirect,
  useLoaderData,
} from 'remix';
import { z } from 'zod';
import { Dialog } from '@reach/dialog';
import dialogStyles from '@reach/dialog/styles.css';
import {
  createNote,
  updateNote,
  getNotes,
  INote,
} from '~/data-handlers/notes.server';
import notesStyles from '~/styles/notes.css';
import Spacer from '~/components/Spacer';

let NoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
});


export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: dialogStyles },
    { rel: 'stylesheet', href: notesStyles },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  let body = await request.formData();

  let title = body.get('title');
  let content = body.get('content');
  // TODO: account for possible checkboxes...

  if (!title) {
    throw new Error(
      'TODO: handle validation: https://remix.run/docs/en/v1/tutorials/jokes'
    );
  }

  if (!content) {
    throw new Error(
      'TODO: handle validation: https://remix.run/docs/en/v1/tutorials/jokes'
    );
  }

  let method = request.method.toLowerCase();

  if (method === 'post') {
    console.log('CREATE');

    await createNote(title, content);
  } else if (method === 'put') {
    let id = body.get('id');
    if (!id) {
      throw new Error(
        'TODO: handle validation: https://remix.run/docs/en/v1/tutorials/jokes'
      );
    }
    console.log('EDIT!', { id, title, content });
    await updateNote(id, title, content);
  }

  return redirect('/');
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
  return (
    <Dialog isOpen={isOpen} onDismiss={onClose} aria-label="Add new note form">
      <Form className="note__form" method="post" onSubmit={onClose}>
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
        <button className="button__primary" type="submit">
          Create
        </button>
        <button className="button__secondary" type="button" onClick={onClose}>
          Cancel
        </button>
      </Form>
    </Dialog>
  );
}

type EditNoteFormProps = {
  isOpen: boolean;
  onClose: () => void;
  note: INote | null;
};

function EditNoteForm({ isOpen, onClose, note }: EditNoteFormProps) {
  return (
    <Dialog isOpen={isOpen} onDismiss={onClose} aria-label="Edit note form">
      <Form className="note__form" method="put" onSubmit={onClose}>
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
        <button className="button__primary" type="submit">
          Save
        </button>
        <button className="button__secondary" type="button" onClick={onClose}>
          Cancel
        </button>
      </Form>
    </Dialog>
  );
}

export default function Index() {
  let [showNewNoteForm, setShowNewNoteForm] = useState<boolean>(false);
  let [editNote, setEditNote] = useState<INote | null>(null);

  let notes = useLoaderData<INote[]>();

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
    </div>
  );
}
