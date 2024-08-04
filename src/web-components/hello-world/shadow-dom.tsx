type HelloWorldDsdButtonProps = {
  label: string;
};

// 1. `<template>`要素を使って`HelloWorldDsdButton`の構造を定義
export const HelloWorldDsdButton = ({ label }: HelloWorldDsdButtonProps) => {
  return (
    <hello-world-button>
      <template
        // 1.1. `<template>`要素の`shadowrootmode`属性にopenを指定
        shadowrootmode="open"
        // 1.2. `<template>`要素の中にShadow DOMに追加したい要素を記述
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
    </hello-world-button>
  );
};
