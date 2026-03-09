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
      return <p style={{ textAlign }}>{children}</p>;
    },
    heading: ({ children, textAlign, level }) => {
      const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
      const headingClasses = {
        1: 'text-4xl font-bold mb-6 mt-8',
        2: 'text-3xl font-bold mb-5 mt-7',
        3: 'text-2xl font-bold mb-4 mt-6',
        4: 'text-xl font-bold mb-3 mt-5',
        5: 'text-lg font-bold mb-3 mt-4',
        6: 'text-base font-bold mb-2 mt-3',
      }[level] || 'text-lg font-bold mb-3';
      return (
        <HeadingTag
          className={`${headingClasses} text-[#212121] dark:text-[#ffffff]`}
          style={{ textAlign }}
        >
          {children}
        </HeadingTag>
      );
    },
    list: ({ children, type }) => {
      return type === 'unordered' ? (
        <ul style={{listStyleType:'disc', marginLeft:20}}>{children.map((child, index) => <li key={index}>{child}</li>)}</ul>
      ) : (
        <ol style={{listStyleType:'decimal', marginLeft:20}}>{children.map((child, index) => <li key={index}>{child}</li>)}</ol>
      );
    },
    divider: () => {
      return <hr style={{ marginTop: "2rem" }} />;
    },
  },
};

export default renderers;