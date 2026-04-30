import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Undo, Redo, FileText,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { ToastContainer } from '../../../components/ui/Toast';
import { Spinner } from '../../../components/ui/Spinner';
import { useToast } from '../../../hooks/useToast';
import { useGetLegalPageQuery, useUpdateLegalPageMutation } from '../api/legalPagesApi';
import { cn } from '../../../lib/utils';

type PageType = 'privacy' | 'terms';

const TABS: { type: PageType; label: string }[] = [
  { type: 'privacy', label: 'Privacy Policy' },
  { type: 'terms', label: 'Terms of Service' },
];

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'rounded p-1.5 transition-colors',
        active
          ? 'bg-[var(--primary)] text-white'
          : 'text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 px-3 py-2 bg-gray-50 rounded-t-lg">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-gray-300" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-gray-300" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-gray-300" />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

function LegalEditor({ pageType }: { pageType: PageType }) {
  const { toasts, addToast, dismissToast } = useToast();
  const { data, isLoading } = useGetLegalPageQuery(pageType);
  const [updateLegalPage, { isLoading: saving }] = useUpdateLegalPageMutation();
  const [dirty, setDirty] = useState(false);
  const [localContent, setLocalContent] = useState('');

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: '',
    onUpdate: ({ editor }) => {
      setLocalContent(editor.getHTML());
      setDirty(true);
    },
  });

  useEffect(() => {
    if (data && editor && !editor.isDestroyed) {
      editor.commands.setContent(data.content);
      setLocalContent(data.content);
      setDirty(false);
    }
  }, [data, editor]);

  const handleSave = async () => {
    try {
      await updateLegalPage({ type: pageType, content: localContent }).unwrap();
      setDirty(false);
      addToast('Content saved successfully.', 'success');
    } catch {
      addToast('Failed to save content.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" className="text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <EditorToolbar editor={editor} />
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none min-h-[480px] px-6 py-4 focus-within:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[480px]"
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={!dirty}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white min-w-32"
        >
          Save Changes
        </Button>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export function LegalPagesPage() {
  const [activeTab, setActiveTab] = useState<PageType>('privacy');

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Legal Pages</h1>
        <p className="text-sm text-gray-500">
          Edit your Privacy Policy and Terms of Service. Content is publicly accessible at{' '}
          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">/privacy</code> and{' '}
          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">/terms</code>.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.type}
            type="button"
            onClick={() => setActiveTab(tab.type)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.type
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <FileText className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <LegalEditor key={activeTab} pageType={activeTab} />
    </div>
  );
}
