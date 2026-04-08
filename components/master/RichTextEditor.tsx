"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef } from "react";
import { Bold, Italic, Heading1, Heading2, List, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = "Escreva suas notas..." }: RichTextEditorProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => { onChangeRef.current(editor.getHTML()); }, 3000);
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm max-w-none p-4 min-h-[200px] focus:outline-none",
      },
    },
  });

  // Flush pending changes on unmount
  useEffect(() => {
    return () => {
      clearTimeout(debounceRef.current);
      if (editor && !editor.isDestroyed) {
        onChangeRef.current(editor.getHTML());
      }
    };
  }, [editor]);

  // Sync content when prop changes externally (e.g. tab switch remount)
  useEffect(() => {
    if (editor && !editor.isDestroyed && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) return null;

  const ToolButton = ({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} className={cn("p-1.5 rounded transition-colors", active ? "bg-gold/20 text-gold" : "text-parchment-light/40 hover:text-parchment-light")}>{children}</button>
  );

  return (
    <div className="border border-gold/20 rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 px-2 py-1 border-b border-gold/10 bg-ink">
        <ToolButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></ToolButton>
        <ToolButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></ToolButton>
        <ToolButton active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 size={16} /></ToolButton>
        <ToolButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></ToolButton>
        <ToolButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></ToolButton>
        <ToolButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></ToolButton>
      </div>
      <EditorContent editor={editor} className="bg-ink-light" />
    </div>
  );
}
