import { useState } from 'react';
import {
  ActionFunction,
  Form,
  LinksFunction,
  LoaderFunction,
  redirect,
  useLoaderData,
} from 'remix';
import { Dialog } from '@reach/dialog';
import dialogStyles from '@reach/dialog/styles.css';
import { createNote, getNotes, INote } from '~/data-handlers/notes.server';
import notesStyles from '~/styles/notes.css';
import Spacer from '~/components/Spacer';

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

  await createNote(title, content);

  return redirect('/');
};

export const loader: LoaderFunction = async () => {
  return await getNotes();
};

type NoteProps = {
  title: string;
  content: string;
  // TODO: checkbox bro'
};

function Note({ title, content }: NoteProps) {
  return (
    <div className="note__container">
      <h2>{title}</h2>
      <p>{content}</p>
    </div>
  );
}

export default function Index() {
  let [showNewNoteForm, setShowNewNoteForm] = useState<boolean>(false);
  let notes = useLoaderData<INote[]>();

  function handleClose() {
    setShowNewNoteForm(false);
  }

  function handleClickAddNewNote() {
    setShowNewNoteForm(true);
  }

  return (
    <div className="index__container">
      <h1>Duly noted!</h1>
      <button onClick={handleClickAddNewNote}>Add note</button>
      <div className="notes__container">
        {notes.map(({ id, title, content }) => (
          <Note key={id} title={title} content={content} />
        ))}
      </div>
      <Dialog
        isOpen={showNewNoteForm}
        onDismiss={handleClose}
        aria-label="Add new note form"
      >
        <Form method="post" onSubmit={handleClose}>
          <input type="text" name="title" placeholder="Title..." />
          <textarea rows="2" cols="20" name="content" placeholder="Notes..." />
          {/* TODO: add checkboxes... */}
          <button type="submit">Create</button>
          <button type="button" onClick={handleClose}>
            Cancel
          </button>
        </Form>
      </Dialog>
    </div>
  );
}
