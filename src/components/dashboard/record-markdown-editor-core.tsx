"use client";

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  Button as MDXToolbarButton,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertCodeBlock,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  Separator,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  type ImagePreviewHandler,
  type MDXEditorMethods,
  type Translation,
  type ViewMode,
} from "@mdxeditor/editor";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey } from "lexical";
import { ImageUp, Maximize2, Minimize2, Trash2 } from "lucide-react";
import { useMemo, type MutableRefObject } from "react";

type ImageScale = 50 | 75 | 100;

function readImageScale(alt: string) {
  const match = alt.match(/^(.*?)(?:\|(?:(?:\d+)x(?:\d+),\s*)?(50|75|100)%)$/);

  return {
    altText: match ? match[1] : alt,
    scale: (match ? Number(match[2]) : 100) as ImageScale,
  };
}

function writeImageScale(alt: string, scale: ImageScale) {
  const { altText } = readImageScale(alt);
  return `${altText}|${scale}%`;
}

function UploadImageButton({ label }: { label: string }) {
  return (
    <MDXToolbarButton
      aria-label={label}
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("curvio:open-image-picker", {
            detail: { insert: true },
          }),
        )
      }
      title={label}
      type="button"
    >
      <ImageUp aria-hidden className="h-4 w-4" />
    </MDXToolbarButton>
  );
}

function ImageEditToolbar({
  alt = "",
  locale = "en",
  nodeKey = "",
}: {
  alt?: string;
  locale?: "en" | "zh";
  nodeKey?: string;
}) {
  const [editor] = useLexicalComposerContext();
  const { scale } = readImageScale(alt);
  const labels = locale === "zh"
    ? {
        delete: "\u5220\u9664\u56fe\u7247",
        larger: "\u653e\u5927\u56fe\u7247",
        smaller: "\u7f29\u5c0f\u56fe\u7247",
      }
    : {
        delete: "Delete image",
        larger: "Larger image",
        smaller: "Smaller image",
      };

  function updateImageSize(nextScale: ImageScale) {
    if (!nodeKey) {
      return;
    }

    editor.update(() => {
      const node = $getNodeByKey(nodeKey);

      if (!node || !("setWidthAndHeight" in node) || !("setAltText" in node)) {
        return;
      }

      const imageNode = node as {
        setWidthAndHeight: (width: number | "inherit", height: number | "inherit") => void;
        setAltText: (altText: string) => void;
      };
      imageNode.setWidthAndHeight("inherit", "inherit");
      imageNode.setAltText(writeImageScale(alt, nextScale));
    });
  }

  function deleteImage() {
    if (!nodeKey) {
      return;
    }

    editor.update(() => {
      $getNodeByKey(nodeKey)?.remove();
    });
  }

  return (
    <div className="curvio-image-toolbar">
      <button
        aria-label={labels.smaller}
        disabled={scale === 50}
        onClick={() => updateImageSize(scale === 100 ? 75 : 50)}
        title={labels.smaller}
        type="button"
      >
        <Minimize2 className="h-4 w-4" />
      </button>
      <button
        aria-label={labels.larger}
        disabled={scale === 100}
        onClick={() => updateImageSize(scale === 50 ? 75 : 100)}
        title={labels.larger}
        type="button"
      >
        <Maximize2 className="h-4 w-4" />
      </button>
      <button aria-label={labels.delete} onClick={deleteImage} title={labels.delete} type="button">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

const zhToolbarText: Record<string, string> = {
  "Select block type": "\u9009\u62e9\u683c\u5f0f",
  "Bulleted list": "\u6253\u70b9\u5217\u8868",
  "Check list": "\u5f85\u529e\u5217\u8868",
  "Code block": "\u4ee3\u7801\u5757",
  "Create link": "\u94fe\u63a5",
  "Insert code block": "\u4ee3\u7801\u5757",
  "Insert image": "\u4e0a\u4f20\u56fe\u7247",
  "Insert table": "\u8868\u683c",
  "Insert thematic break": "\u5206\u5272\u7ebf",
  "Numbered list": "\u6570\u5b57\u5217\u8868",
  Bold: "\u52a0\u7c97",
  Code: "\u884c\u5185\u4ee3\u7801",
  "Choose block type": "\u9009\u62e9\u683c\u5f0f",
  Heading: "\u6807\u9898",
  "Heading {{level}}": "\u6807\u9898 {{level}}",
  Italic: "\u659c\u4f53",
  "Multiple block types": "\u591a\u79cd\u683c\u5f0f",
  Paragraph: "\u6b63\u6587",
  Quote: "\u5f15\u7528",
  Source: "Markdown",
  "Rich text": "\u666e\u901a",
  Table: "\u8868\u683c",
};

export function RecordMarkdownEditorCore({
  editorRef,
  imagePreviewHandler,
  initialViewMode,
  markdown,
  onChange,
  placeholder,
  locale,
  uploadImageLabel,
}: {
  editorRef: MutableRefObject<MDXEditorMethods | null>;
  imagePreviewHandler: ImagePreviewHandler;
  initialViewMode: ViewMode;
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder: string;
  locale: "en" | "zh";
  uploadImageLabel: string;
}) {
  const translation = useMemo<Translation | undefined>(() => {
    if (locale !== "zh") {
      return undefined;
    }

    return (_key, defaultValue, interpolations) => {
      const translated = zhToolbarText[defaultValue] ?? defaultValue;

      return translated.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
        interpolations?.[key] === undefined ? match : String(interpolations[key]),
      );
    };
  }, [locale]);

  const plugins = useMemo(
    () => [
      headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
      quotePlugin(),
      listsPlugin(),
      thematicBreakPlugin(),
      tablePlugin(),
      codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
      codeMirrorPlugin({
        codeBlockLanguages: {
          css: "CSS",
          html: "HTML",
          js: "JavaScript",
          json: "JSON",
          markdown: "Markdown",
          txt: "Plain text",
          ts: "TypeScript",
          tsx: "TSX",
        },
      }),
      linkPlugin(),
      imagePlugin({
        disableImageResize: true,
        disableImageSettingsButton: true,
        EditImageToolbar: (props) => <ImageEditToolbar {...props} locale={locale} />,
        imagePreviewHandler,
      }),
      markdownShortcutPlugin(),
      toolbarPlugin({
        toolbarContents: () => (
          <DiffSourceToggleWrapper options={["rich-text", "source"]}>
            <BlockTypeSelect />
            <Separator />
            <BoldItalicUnderlineToggles options={["Bold", "Italic"]} />
            <CodeToggle />
            <Separator />
            <CreateLink />
            <UploadImageButton label={uploadImageLabel} />
            <Separator />
            <ListsToggle options={["bullet", "number", "check"]} />
            <Separator />
            <InsertCodeBlock />
            <InsertThematicBreak />
            <InsertTable />
          </DiffSourceToggleWrapper>
        ),
      }),
      diffSourcePlugin({ viewMode: initialViewMode }),
    ],
    [imagePreviewHandler, initialViewMode, locale, uploadImageLabel],
  );

  return (
    <MDXEditor
      className="curvio-mdx-editor"
      contentEditableClassName="curvio-mdx-content"
      markdown={markdown}
      onChange={(nextMarkdown) => onChange(nextMarkdown)}
      placeholder={placeholder}
      plugins={plugins}
      ref={editorRef}
      suppressHtmlProcessing
      translation={translation}
      trim={false}
    />
  );
}
