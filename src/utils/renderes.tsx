import { DocumentRendererProps } from "@keystone-6/document-renderer";
import { JSX } from "react";

const renderers: DocumentRendererProps['renderers'] = {
  inline: {
    bold: ({ children }) => {
      return <strong>{children}</strong>;
    },
  },
  block: {
    paragraph: ({ children, textAlign }) => {
      return (
        <p
          className="mb-4 leading-relaxed text-[#424242] dark:text-[#e0e0e0] last:mb-0"
          style={{ textAlign }}
        >
          {children}
        </p>
      );
    },
    heading: ({ children, textAlign, level }) => {
      const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
      const headingClasses = {
        1: 'text-4xl font-bold mb-6 mt-10',
        2: 'text-3xl font-bold mb-5 mt-9',
        3: 'text-2xl font-bold mb-4 mt-8',
        4: 'text-xl font-bold mb-3 mt-6',
        5: 'text-lg font-bold mb-3 mt-5',
        6: 'text-base font-bold mb-2 mt-4',
      }[level] || 'text-lg font-bold mb-3 mt-5';
      return (
        <HeadingTag
          className={`${headingClasses} text-[#212121] dark:text-[#ffffff] first:mt-0`}
          style={{ textAlign }}
        >
          {children}
        </HeadingTag>
      );
    },
    list: ({ children, type }) => {
      const items = children.map((child, index) => (
        <li key={index} className="leading-relaxed text-[#424242] dark:text-[#e0e0e0]">
          {child}
        </li>
      ));
      return type === 'unordered' ? (
        <ul className="mb-4 ml-5 list-disc space-y-2 last:mb-0">{items}</ul>
      ) : (
        <ol className="mb-4 ml-5 list-decimal space-y-2 last:mb-0">{items}</ol>
      );
    },
    divider: () => {
      return <hr className="my-8 border-[#e0e0e0] dark:border-[#3a3a3a]" />;
    },
  },
};

export default renderers;