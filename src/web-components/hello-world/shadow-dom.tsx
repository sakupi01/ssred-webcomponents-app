type HelloWorldDsdButtonProps = {
  label: string;
};

// Declarative Shadow DOMを用いた`HelloWorldDsd`
export const HelloWorldDsdButton = ({ label }: HelloWorldDsdButtonProps) => {
  return (
    <hello-world>
      <template
        shadowrootmode="open"
        dangerouslySetInnerHTML={{
          __html: `
          <style>
            button {
              background-color: pink;
              color: white;
              padding: 15px 32px;
              font-size: 16px;
              margin: 4px 2px;
              cursor: pointer;
            }
          </style>
          <button>${label}</button>
        `,
        }}
      />
    </hello-world>
  );
};
