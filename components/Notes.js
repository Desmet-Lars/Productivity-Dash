'use client';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/FirebaseConfig';
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({ id: '', title: '', content: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsClient(true);
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    try {
      const q = query(
        collection(db, 'notes'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const fetchedNotes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const saveNote = async () => {
    if (!currentNote.title.trim()) return;

    try {
      if (isEditing) {
        const noteRef = doc(db, 'notes', currentNote.id);
        await updateDoc(noteRef, {
          title: currentNote.title,
          content: currentNote.content,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'notes'), {
          userId: user.uid,
          title: currentNote.title,
          content: currentNote.content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      await fetchNotes();
      setCurrentNote({ id: '', title: '', content: '' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
      await fetchNotes();
      if (currentNote.id === id) {
        setCurrentNote({ id: '', title: '', content: '' });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  if (!isClient) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-gray-100 rounded-lg"></div>
          <div className="h-32 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
        </div>
        <button
          onClick={() => {
            setCurrentNote({ id: '', title: '', content: '' });
            setIsEditing(false);
          }}
          className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Note
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Notes List */}
        <div className="w-64 border-r border-gray-100 p-3 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No notes yet</p>
              <p className="text-xs text-gray-400 mt-1">Create your first note!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setCurrentNote(note);
                    setIsEditing(true);
                  }}
                  className={`p-3 rounded-lg cursor-pointer group transition-all duration-200 ${
                    currentNote.id === note.id
                      ? 'bg-blue-50 border-blue-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                      {note.title || 'Untitled'}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all duration-200"
                    >
                      <svg className="w-3 h-3 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{note.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0 p-4">
          <input
            type="text"
            value={currentNote.title}
            onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
            placeholder="Note title..."
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 mb-3"
          />
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 relative">
              <textarea
                value={currentNote.content}
                onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                placeholder="Write your note... (Markdown supported)"
                className="absolute inset-0 w-full h-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 resize-none"
              />
            </div>
            <div className="flex justify-between items-center mt-3">
              <div className="text-xs text-gray-500">
                {currentNote.content.length} characters
              </div>
              <button
                onClick={saveNote}
                disabled={!currentNote.title.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {isEditing ? 'Update Note' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
