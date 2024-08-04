"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // node_modules/hono/dist/utils/html.js
  var HtmlEscapedCallbackPhase = {
    Stringify: 1,
    BeforeStream: 2,
    Stream: 3
  };
  var raw = (value, callbacks) => {
    const escapedString = new String(value);
    escapedString.isEscaped = true;
    escapedString.callbacks = callbacks;
    return escapedString;
  };
  var escapeRe = /[&<>'"]/;
  var stringBufferToString = async (buffer, callbacks) => {
    let str = "";
    callbacks ||= [];
    for (let i = buffer.length - 1; ; i--) {
      str += buffer[i];
      i--;
      if (i < 0) {
        break;
      }
      let r = await buffer[i];
      if (typeof r === "object") {
        callbacks.push(...r.callbacks || []);
      }
      const isEscaped = r.isEscaped;
      r = await (typeof r === "object" ? r.toString() : r);
      if (typeof r === "object") {
        callbacks.push(...r.callbacks || []);
      }
      if (r.isEscaped ?? isEscaped) {
        str += r;
      } else {
        const buf = [str];
        escapeToBuffer(r, buf);
        str = buf[0];
      }
    }
    return raw(str, callbacks);
  };
  var escapeToBuffer = (str, buffer) => {
    const match = str.search(escapeRe);
    if (match === -1) {
      buffer[0] += str;
      return;
    }
    let escape;
    let index;
    let lastIndex = 0;
    for (index = match; index < str.length; index++) {
      switch (str.charCodeAt(index)) {
        case 34:
          escape = "&quot;";
          break;
        case 39:
          escape = "&#39;";
          break;
        case 38:
          escape = "&amp;";
          break;
        case 60:
          escape = "&lt;";
          break;
        case 62:
          escape = "&gt;";
          break;
        default:
          continue;
      }
      buffer[0] += str.substring(lastIndex, index) + escape;
      lastIndex = index + 1;
    }
    buffer[0] += str.substring(lastIndex, index);
  };
  var resolveCallbackSync = (str) => {
    const callbacks = str.callbacks;
    if (!callbacks?.length) {
      return str;
    }
    const buffer = [str];
    const context = {};
    callbacks.forEach((c) => c({ phase: HtmlEscapedCallbackPhase.Stringify, buffer, context }));
    return buffer[0];
  };

  // node_modules/hono/dist/jsx/constants.js
  var DOM_RENDERER = Symbol("RENDERER");
  var DOM_ERROR_HANDLER = Symbol("ERROR_HANDLER");
  var DOM_STASH = Symbol("STASH");
  var DOM_INTERNAL_TAG = Symbol("INTERNAL");
  var PERMALINK = Symbol("PERMALINK");

  // node_modules/hono/dist/jsx/dom/utils.js
  var setInternalTagFlag = (fn) => {
    ;
    fn[DOM_INTERNAL_TAG] = true;
    return fn;
  };
  var JSXNodeCompatPrototype = {
    type: {
      get() {
        return this.tag;
      }
    },
    ref: {
      get() {
        return this.props?.ref;
      }
    }
  };
  var newJSXNode = (obj) => Object.defineProperties(obj, JSXNodeCompatPrototype);

  // node_modules/hono/dist/jsx/dom/context.js
  var createContextProviderFunction = (values) => ({ value, children }) => {
    if (!children) {
      return void 0;
    }
    const props = {
      children: [
        {
          tag: setInternalTagFlag(() => {
            values.push(value);
          }),
          props: {}
        }
      ]
    };
    if (Array.isArray(children)) {
      props.children.push(...children.flat());
    } else {
      props.children.push(children);
    }
    props.children.push({
      tag: setInternalTagFlag(() => {
        values.pop();
      }),
      props: {}
    });
    const res = newJSXNode({ tag: "", props });
    res[DOM_ERROR_HANDLER] = (err) => {
      values.pop();
      throw err;
    };
    return res;
  };
  var createContext = (defaultValue) => {
    const values = [defaultValue];
    const context = createContextProviderFunction(values);
    context.values = values;
    context.Provider = context;
    globalContexts.push(context);
    return context;
  };

  // node_modules/hono/dist/jsx/context.js
  var globalContexts = [];
  var createContext2 = (defaultValue) => {
    const values = [defaultValue];
    const context = (props) => {
      values.push(props.value);
      let string;
      try {
        string = props.children ? (Array.isArray(props.children) ? new JSXFragmentNode("", {}, props.children) : props.children).toString() : "";
      } finally {
        values.pop();
      }
      if (string instanceof Promise) {
        return string.then((resString) => raw(resString, resString.callbacks));
      } else {
        return raw(string);
      }
    };
    context.values = values;
    context.Provider = context;
    context[DOM_RENDERER] = createContextProviderFunction(values);
    globalContexts.push(context);
    return context;
  };
  var useContext = (context) => {
    return context.values.at(-1);
  };

  // node_modules/hono/dist/jsx/utils.js
  var normalizeElementKeyMap = /* @__PURE__ */ new Map([
    ["className", "class"],
    ["htmlFor", "for"],
    ["crossOrigin", "crossorigin"],
    ["httpEquiv", "http-equiv"],
    ["itemProp", "itemprop"],
    ["fetchPriority", "fetchpriority"],
    ["noModule", "nomodule"],
    ["formAction", "formaction"]
  ]);
  var normalizeIntrinsicElementKey = (key) => normalizeElementKeyMap.get(key) || key;
  var styleObjectForEach = (style3, fn) => {
    for (const [k, v] of Object.entries(style3)) {
      const key = k[0] === "-" || !/[A-Z]/.test(k) ? k : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      fn(
        key,
        v == null ? null : typeof v === "number" ? !key.match(
          /^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/
        ) ? `${v}px` : `${v}` : v
      );
    }
  };

  // node_modules/hono/dist/jsx/intrinsic-element/components.js
  var components_exports = {};
  __export(components_exports, {
    button: () => button,
    form: () => form,
    input: () => input,
    link: () => link,
    meta: () => meta,
    script: () => script,
    style: () => style,
    title: () => title
  });

  // node_modules/hono/dist/jsx/intrinsic-element/common.js
  var deDupeKeyMap = {
    title: [],
    script: ["src"],
    style: ["data-href"],
    link: ["href"],
    meta: ["name", "httpEquiv", "charset", "itemProp"]
  };
  var domRenderers = {};
  var dataPrecedenceAttr = "data-precedence";

  // node_modules/hono/dist/jsx/children.js
  var toArray = (children) => Array.isArray(children) ? children : [children];

  // node_modules/hono/dist/jsx/intrinsic-element/components.js
  var metaTagMap = /* @__PURE__ */ new WeakMap();
  var insertIntoHead = (tagName, tag, props, precedence) => ({ buffer, context }) => {
    if (!buffer) {
      return;
    }
    const map = metaTagMap.get(context) || {};
    metaTagMap.set(context, map);
    const tags = map[tagName] ||= [];
    let duped = false;
    const deDupeKeys = deDupeKeyMap[tagName];
    if (deDupeKeys.length > 0) {
      LOOP:
        for (const [, tagProps] of tags) {
          for (const key of deDupeKeys) {
            if ((tagProps?.[key] ?? null) === props?.[key]) {
              duped = true;
              break LOOP;
            }
          }
        }
    }
    if (duped) {
      buffer[0] = buffer[0].replaceAll(tag, "");
    } else if (deDupeKeys.length > 0) {
      tags.push([tag, props, precedence]);
    } else {
      tags.unshift([tag, props, precedence]);
    }
    if (buffer[0].indexOf("</head>") !== -1) {
      let insertTags;
      if (precedence === void 0) {
        insertTags = tags.map(([tag2]) => tag2);
      } else {
        const precedences = [];
        insertTags = tags.map(([tag2, , precedence2]) => {
          let order = precedences.indexOf(precedence2);
          if (order === -1) {
            precedences.push(precedence2);
            order = precedences.length - 1;
          }
          return [tag2, order];
        }).sort((a, b) => a[1] - b[1]).map(([tag2]) => tag2);
      }
      insertTags.forEach((tag2) => {
        buffer[0] = buffer[0].replaceAll(tag2, "");
      });
      buffer[0] = buffer[0].replace(/(?=<\/head>)/, insertTags.join(""));
    }
  };
  var returnWithoutSpecialBehavior = (tag, children, props) => raw(new JSXNode(tag, props, toArray(children ?? [])).toString());
  var documentMetadataTag = (tag, children, props, sort) => {
    if ("itemProp" in props) {
      return returnWithoutSpecialBehavior(tag, children, props);
    }
    let { precedence, blocking, ...restProps } = props;
    precedence = sort ? precedence ?? "" : void 0;
    if (sort) {
      restProps[dataPrecedenceAttr] = precedence;
    }
    const string = new JSXNode(tag, restProps, toArray(children || [])).toString();
    if (string instanceof Promise) {
      return string.then(
        (resString) => raw(string, [
          ...resString.callbacks || [],
          insertIntoHead(tag, resString, restProps, precedence)
        ])
      );
    } else {
      return raw(string, [insertIntoHead(tag, string, restProps, precedence)]);
    }
  };
  var title = ({ children, ...props }) => {
    const nameSpaceContext3 = getNameSpaceContext();
    if (nameSpaceContext3 && useContext(nameSpaceContext3) === "svg") {
      new JSXNode("title", props, toArray(children ?? []));
    }
    return documentMetadataTag("title", children, props, false);
  };
  var script = ({
    children,
    ...props
  }) => {
    if (["src", "async"].some((k) => !props[k])) {
      return returnWithoutSpecialBehavior("script", children, props);
    }
    return documentMetadataTag("script", children, props, false);
  };
  var style = ({
    children,
    ...props
  }) => {
    if (!["href", "precedence"].every((k) => k in props)) {
      return returnWithoutSpecialBehavior("style", children, props);
    }
    props["data-href"] = props.href;
    delete props.href;
    return documentMetadataTag("style", children, props, true);
  };
  var link = ({ children, ...props }) => {
    if (["onLoad", "onError"].some((k) => k in props) || props.rel === "stylesheet" && (!("precedence" in props) || "disabled" in props)) {
      return returnWithoutSpecialBehavior("link", children, props);
    }
    return documentMetadataTag("link", children, props, "precedence" in props);
  };
  var meta = ({ children, ...props }) => {
    return documentMetadataTag("meta", children, props, false);
  };
  var newJSXNode2 = (tag, { children, ...props }) => new JSXNode(tag, props, toArray(children ?? []));
  var form = (props) => {
    if (typeof props.action === "function") {
      props.action = PERMALINK in props.action ? props.action[PERMALINK] : void 0;
    }
    return newJSXNode2("form", props);
  };
  var formActionableElement = (tag, props) => {
    if (typeof props.formAction === "function") {
      props.formAction = PERMALINK in props.formAction ? props.formAction[PERMALINK] : void 0;
    }
    return newJSXNode2(tag, props);
  };
  var input = (props) => formActionableElement("input", props);
  var button = (props) => formActionableElement("button", props);

  // node_modules/hono/dist/jsx/base.js
  var nameSpaceContext = void 0;
  var getNameSpaceContext = () => nameSpaceContext;
  var toSVGAttributeName = (key) => /[A-Z]/.test(key) && key.match(
    /^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/
  ) ? key.replace(/([A-Z])/g, "-$1").toLowerCase() : key;
  var emptyTags = [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
  ];
  var booleanAttributes = [
    "allowfullscreen",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "controls",
    "default",
    "defer",
    "disabled",
    "download",
    "formnovalidate",
    "hidden",
    "inert",
    "ismap",
    "itemscope",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "readonly",
    "required",
    "reversed",
    "selected"
  ];
  var childrenToStringToBuffer = (children, buffer) => {
    for (let i = 0, len = children.length; i < len; i++) {
      const child = children[i];
      if (typeof child === "string") {
        escapeToBuffer(child, buffer);
      } else if (typeof child === "boolean" || child === null || child === void 0) {
        continue;
      } else if (child instanceof JSXNode) {
        child.toStringToBuffer(buffer);
      } else if (typeof child === "number" || child.isEscaped) {
        ;
        buffer[0] += child;
      } else if (child instanceof Promise) {
        buffer.unshift("", child);
      } else {
        childrenToStringToBuffer(child, buffer);
      }
    }
  };
  var JSXNode = class {
    tag;
    props;
    key;
    children;
    isEscaped = true;
    localContexts;
    constructor(tag, props, children) {
      this.tag = tag;
      this.props = props;
      this.children = children;
    }
    get type() {
      return this.tag;
    }
    get ref() {
      return this.props.ref || null;
    }
    toString() {
      const buffer = [""];
      this.localContexts?.forEach(([context, value]) => {
        context.values.push(value);
      });
      try {
        this.toStringToBuffer(buffer);
      } finally {
        this.localContexts?.forEach(([context]) => {
          context.values.pop();
        });
      }
      return buffer.length === 1 ? "callbacks" in buffer ? resolveCallbackSync(raw(buffer[0], buffer.callbacks)).toString() : buffer[0] : stringBufferToString(buffer, buffer.callbacks);
    }
    toStringToBuffer(buffer) {
      const tag = this.tag;
      const props = this.props;
      let { children } = this;
      buffer[0] += `<${tag}`;
      const normalizeKey = nameSpaceContext && useContext(nameSpaceContext) === "svg" ? (key) => toSVGAttributeName(normalizeIntrinsicElementKey(key)) : (key) => normalizeIntrinsicElementKey(key);
      for (let [key, v] of Object.entries(props)) {
        key = normalizeKey(key);
        if (key === "children") {
        } else if (key === "style" && typeof v === "object") {
          let styleStr = "";
          styleObjectForEach(v, (property, value) => {
            if (value != null) {
              styleStr += `${styleStr ? ";" : ""}${property}:${value}`;
            }
          });
          buffer[0] += ' style="';
          escapeToBuffer(styleStr, buffer);
          buffer[0] += '"';
        } else if (typeof v === "string") {
          buffer[0] += ` ${key}="`;
          escapeToBuffer(v, buffer);
          buffer[0] += '"';
        } else if (v === null || v === void 0) {
        } else if (typeof v === "number" || v.isEscaped) {
          buffer[0] += ` ${key}="${v}"`;
        } else if (typeof v === "boolean" && booleanAttributes.includes(key)) {
          if (v) {
            buffer[0] += ` ${key}=""`;
          }
        } else if (key === "dangerouslySetInnerHTML") {
          if (children.length > 0) {
            throw "Can only set one of `children` or `props.dangerouslySetInnerHTML`.";
          }
          children = [raw(v.__html)];
        } else if (v instanceof Promise) {
          buffer[0] += ` ${key}="`;
          buffer.unshift('"', v);
        } else if (typeof v === "function") {
          if (!key.startsWith("on")) {
            throw `Invalid prop '${key}' of type 'function' supplied to '${tag}'.`;
          }
        } else {
          buffer[0] += ` ${key}="`;
          escapeToBuffer(v.toString(), buffer);
          buffer[0] += '"';
        }
      }
      if (emptyTags.includes(tag) && children.length === 0) {
        buffer[0] += "/>";
        return;
      }
      buffer[0] += ">";
      childrenToStringToBuffer(children, buffer);
      buffer[0] += `</${tag}>`;
    }
  };
  var JSXFunctionNode = class extends JSXNode {
    toStringToBuffer(buffer) {
      const { children } = this;
      const res = this.tag.call(null, {
        ...this.props,
        children: children.length <= 1 ? children[0] : children
      });
      if (res instanceof Promise) {
        if (globalContexts.length === 0) {
          buffer.unshift("", res);
        } else {
          const currentContexts = globalContexts.map((c) => [c, c.values.at(-1)]);
          buffer.unshift(
            "",
            res.then((childRes) => {
              if (childRes instanceof JSXNode) {
                childRes.localContexts = currentContexts;
              }
              return childRes;
            })
          );
        }
      } else if (res instanceof JSXNode) {
        res.toStringToBuffer(buffer);
      } else if (typeof res === "number" || res.isEscaped) {
        buffer[0] += res;
        if (res.callbacks) {
          buffer.callbacks ||= [];
          buffer.callbacks.push(...res.callbacks);
        }
      } else {
        escapeToBuffer(res, buffer);
      }
    }
  };
  var JSXFragmentNode = class extends JSXNode {
    toStringToBuffer(buffer) {
      childrenToStringToBuffer(this.children, buffer);
    }
  };
  var initDomRenderer = false;
  var jsxFn = (tag, props, children) => {
    if (!initDomRenderer) {
      for (const k in domRenderers) {
        ;
        components_exports[k][DOM_RENDERER] = domRenderers[k];
      }
      initDomRenderer = true;
    }
    if (typeof tag === "function") {
      return new JSXFunctionNode(tag, props, children);
    } else if (components_exports[tag]) {
      return new JSXFunctionNode(
        components_exports[tag],
        props,
        children
      );
    } else if (tag === "svg") {
      nameSpaceContext ||= createContext2("");
      return new JSXNode(tag, props, [
        new JSXFunctionNode(
          nameSpaceContext,
          {
            value: tag
          },
          children
        )
      ]);
    } else {
      return new JSXNode(tag, props, children);
    }
  };
  var Fragment = ({
    children
  }) => {
    return new JSXFragmentNode(
      "",
      {
        children
      },
      Array.isArray(children) ? children : children ? [children] : []
    );
  };

  // node_modules/hono/dist/jsx/dom/render.js
  var HONO_PORTAL_ELEMENT = "_hp";
  var eventAliasMap = {
    Change: "Input",
    DoubleClick: "DblClick"
  };
  var nameSpaceMap = {
    svg: "2000/svg",
    math: "1998/Math/MathML"
  };
  var skipProps = /* @__PURE__ */ new Set(["children"]);
  var buildDataStack = [];
  var refCleanupMap = /* @__PURE__ */ new WeakMap();
  var nameSpaceContext2 = void 0;
  var getNameSpaceContext2 = () => nameSpaceContext2;
  var isNodeString = (node) => "t" in node;
  var getEventSpec = (key) => {
    const match = key.match(/^on([A-Z][a-zA-Z]+?(?:PointerCapture)?)(Capture)?$/);
    if (match) {
      const [, eventName, capture] = match;
      return [(eventAliasMap[eventName] || eventName).toLowerCase(), !!capture];
    }
    return void 0;
  };
  var toAttributeName = (element, key) => element instanceof SVGElement && /[A-Z]/.test(key) && (key in element.style || key.match(/^(?:o|pai|str|u|ve)/)) ? key.replace(/([A-Z])/g, "-$1").toLowerCase() : key;
  var applyProps = (container, attributes, oldAttributes) => {
    attributes ||= {};
    for (let [key, value] of Object.entries(attributes)) {
      if (!skipProps.has(key) && (!oldAttributes || oldAttributes[key] !== value)) {
        key = normalizeIntrinsicElementKey(key);
        const eventSpec = getEventSpec(key);
        if (eventSpec) {
          if (oldAttributes) {
            container.removeEventListener(eventSpec[0], oldAttributes[key], eventSpec[1]);
          }
          if (value != null) {
            if (typeof value !== "function") {
              throw new Error(`Event handler for "${key}" is not a function`);
            }
            container.addEventListener(eventSpec[0], value, eventSpec[1]);
          }
        } else if (key === "dangerouslySetInnerHTML" && value) {
          container.innerHTML = value.__html;
        } else if (key === "ref") {
          let cleanup;
          if (typeof value === "function") {
            cleanup = value(container) || (() => value(null));
          } else if (value && "current" in value) {
            value.current = container;
            cleanup = () => value.current = null;
          }
          refCleanupMap.set(container, cleanup);
        } else if (key === "style") {
          const style3 = container.style;
          if (typeof value === "string") {
            style3.cssText = value;
          } else {
            style3.cssText = "";
            if (value != null) {
              styleObjectForEach(value, style3.setProperty.bind(style3));
            }
          }
        } else {
          const nodeName = container.nodeName;
          if (key === "value") {
            if (nodeName === "INPUT" || nodeName === "TEXTAREA" || nodeName === "SELECT") {
              ;
              container.value = value === null || value === void 0 || value === false ? null : value;
              if (nodeName === "TEXTAREA") {
                container.textContent = value;
                continue;
              } else if (nodeName === "SELECT") {
                if (container.selectedIndex === -1) {
                  ;
                  container.selectedIndex = 0;
                }
                continue;
              }
            }
          } else if (key === "checked" && nodeName === "INPUT" || key === "selected" && nodeName === "OPTION") {
            ;
            container[key] = value;
          }
          const k = toAttributeName(container, key);
          if (value === null || value === void 0 || value === false) {
            container.removeAttribute(k);
          } else if (value === true) {
            container.setAttribute(k, "");
          } else if (typeof value === "string" || typeof value === "number") {
            container.setAttribute(k, value);
          } else {
            container.setAttribute(k, value.toString());
          }
        }
      }
    }
    if (oldAttributes) {
      for (let [key, value] of Object.entries(oldAttributes)) {
        if (!skipProps.has(key) && !(key in attributes)) {
          key = normalizeIntrinsicElementKey(key);
          const eventSpec = getEventSpec(key);
          if (eventSpec) {
            container.removeEventListener(eventSpec[0], value, eventSpec[1]);
          } else if (key === "ref") {
            refCleanupMap.get(container)?.();
          } else {
            container.removeAttribute(toAttributeName(container, key));
          }
        }
      }
    }
  };
  var invokeTag = (context, node) => {
    if (node.s) {
      const res = node.s;
      node.s = void 0;
      return res;
    }
    node[DOM_STASH][0] = 0;
    buildDataStack.push([context, node]);
    const func = node.tag[DOM_RENDERER] || node.tag;
    try {
      return [
        func.call(null, {
          ...func.defaultProps || {},
          ...node.props
        })
      ];
    } finally {
      buildDataStack.pop();
    }
  };
  var getNextChildren = (node, container, nextChildren, childrenToRemove, callbacks) => {
    childrenToRemove.push(...node.vR);
    if (typeof node.tag === "function") {
      node[DOM_STASH][1][STASH_EFFECT]?.forEach((data) => callbacks.push(data));
    }
    node.vC.forEach((child) => {
      if (isNodeString(child)) {
        nextChildren.push(child);
      } else {
        if (typeof child.tag === "function" || child.tag === "") {
          child.c = container;
          getNextChildren(child, container, nextChildren, childrenToRemove, callbacks);
        } else {
          nextChildren.push(child);
          childrenToRemove.push(...child.vR);
        }
      }
    });
  };
  var findInsertBefore = (node) => {
    return !node ? null : node.tag === HONO_PORTAL_ELEMENT ? findInsertBefore(node.nN) : node.e || node.vC && node.pP && findInsertBefore(node.vC[0]) || findInsertBefore(node.nN);
  };
  var removeNode = (node) => {
    if (!isNodeString(node)) {
      node[DOM_STASH]?.[1][STASH_EFFECT]?.forEach((data) => data[2]?.());
      refCleanupMap.get(node.e)?.();
      if (node.p === 2) {
        node.vC?.forEach((n) => n.p = 2);
      }
      node.vC?.forEach(removeNode);
    }
    if (!node.p) {
      node.e?.remove();
      delete node.e;
    }
    if (typeof node.tag === "function") {
      updateMap.delete(node);
      fallbackUpdateFnArrayMap.delete(node);
      delete node[DOM_STASH][3];
      node.a = true;
    }
  };
  var apply = (node, container) => {
    node.c = container;
    applyNodeObject(node, container);
  };
  var applyNode = (node, container) => {
    if (isNodeString(node)) {
      container.textContent = node.t;
    } else {
      applyNodeObject(node, container);
    }
  };
  var findChildNodeIndex = (childNodes, child) => {
    if (!child) {
      return;
    }
    for (let i = 0, len = childNodes.length; i < len; i++) {
      if (childNodes[i] === child) {
        return i;
      }
    }
    return;
  };
  var cancelBuild = Symbol();
  var applyNodeObject = (node, container) => {
    const next = [];
    const remove = [];
    const callbacks = [];
    getNextChildren(node, container, next, remove, callbacks);
    const childNodes = container.childNodes;
    let offset = findChildNodeIndex(childNodes, findInsertBefore(node.nN)) ?? findChildNodeIndex(childNodes, next.find((n) => n.tag !== HONO_PORTAL_ELEMENT && n.e)?.e) ?? childNodes.length;
    for (let i = 0, len = next.length; i < len; i++, offset++) {
      const child = next[i];
      let el;
      if (isNodeString(child)) {
        if (child.e && child.d) {
          child.e.textContent = child.t;
        }
        child.d = false;
        el = child.e ||= document.createTextNode(child.t);
      } else {
        el = child.e ||= child.n ? document.createElementNS(child.n, child.tag) : document.createElement(child.tag);
        applyProps(el, child.props, child.pP);
        applyNode(child, el);
      }
      if (child.tag === HONO_PORTAL_ELEMENT) {
        offset--;
      } else if (childNodes[offset] !== el && childNodes[offset - 1] !== child.e) {
        container.insertBefore(el, childNodes[offset] || null);
      }
    }
    remove.forEach(removeNode);
    callbacks.forEach(([, , , , cb]) => cb?.());
    callbacks.forEach(([, cb]) => cb?.());
    requestAnimationFrame(() => {
      callbacks.forEach(([, , , cb]) => cb?.());
    });
  };
  var fallbackUpdateFnArrayMap = /* @__PURE__ */ new WeakMap();
  var build = (context, node, children) => {
    const buildWithPreviousChildren = !children && node.pC;
    if (children) {
      node.pC ||= node.vC;
    }
    let foundErrorHandler;
    try {
      children ||= typeof node.tag == "function" ? invokeTag(context, node) : toArray(node.props.children);
      if (children[0]?.tag === "" && children[0][DOM_ERROR_HANDLER]) {
        foundErrorHandler = children[0][DOM_ERROR_HANDLER];
        context[5].push([context, foundErrorHandler, node]);
      }
      const oldVChildren = buildWithPreviousChildren ? [...node.pC] : node.vC ? [...node.vC] : [];
      const vChildren = [];
      node.vR = buildWithPreviousChildren ? [...node.vC] : [];
      let prevNode;
      children.flat().forEach((c) => {
        let child = buildNode(c);
        if (child) {
          if (typeof child.tag === "function" && !child.tag[DOM_INTERNAL_TAG]) {
            if (globalContexts.length > 0) {
              child[DOM_STASH][2] = globalContexts.map((c2) => [c2, c2.values.at(-1)]);
            }
            if (context[5]?.length) {
              child[DOM_STASH][3] = context[5].at(-1);
            }
          }
          let oldChild;
          const i = oldVChildren.findIndex(
            isNodeString(child) ? (c2) => isNodeString(c2) : child.key !== void 0 ? (c2) => c2.key === child.key : (c2) => c2.tag === child.tag
          );
          if (i !== -1) {
            oldChild = oldVChildren[i];
            oldVChildren.splice(i, 1);
          }
          let skipBuild = false;
          if (oldChild) {
            if (isNodeString(child)) {
              if (oldChild.t !== child.t) {
                ;
                oldChild.t = child.t;
                oldChild.d = true;
              }
              child = oldChild;
            } else if (oldChild.tag !== child.tag) {
              node.vR.push(oldChild);
            } else {
              const pP = oldChild.pP = oldChild.props;
              oldChild.props = child.props;
              oldChild.f ||= child.f || node.f;
              if (typeof child.tag === "function") {
                oldChild[DOM_STASH][2] = child[DOM_STASH][2] || [];
                oldChild[DOM_STASH][3] = child[DOM_STASH][3];
                if (!oldChild.f) {
                  const prevPropsKeys = Object.keys(pP);
                  const currentProps = oldChild.props;
                  skipBuild = prevPropsKeys.length === Object.keys(currentProps).length && prevPropsKeys.every((k) => k in currentProps && currentProps[k] === pP[k]);
                }
              }
              child = oldChild;
            }
          } else if (!isNodeString(child) && nameSpaceContext2) {
            const ns = useContext(nameSpaceContext2);
            if (ns) {
              child.n = ns;
            }
          }
          if (!isNodeString(child) && !skipBuild) {
            build(context, child);
            delete child.f;
          }
          vChildren.push(child);
          for (let p = prevNode; p && !isNodeString(p); p = p.vC?.at(-1)) {
            p.nN = child;
          }
          prevNode = child;
        }
      });
      node.vC = vChildren;
      node.vR.push(...oldVChildren);
      if (buildWithPreviousChildren) {
        delete node.pC;
      }
    } catch (e) {
      node.f = true;
      if (e === cancelBuild) {
        if (foundErrorHandler) {
          return;
        } else {
          throw e;
        }
      }
      const [errorHandlerContext, errorHandler, errorHandlerNode] = node[DOM_STASH]?.[3] || [];
      if (errorHandler) {
        const fallbackUpdateFn = () => update([0, false, context[2]], errorHandlerNode);
        const fallbackUpdateFnArray = fallbackUpdateFnArrayMap.get(errorHandlerNode) || [];
        fallbackUpdateFnArray.push(fallbackUpdateFn);
        fallbackUpdateFnArrayMap.set(errorHandlerNode, fallbackUpdateFnArray);
        const fallback = errorHandler(e, () => {
          const fnArray = fallbackUpdateFnArrayMap.get(errorHandlerNode);
          if (fnArray) {
            const i = fnArray.indexOf(fallbackUpdateFn);
            if (i !== -1) {
              fnArray.splice(i, 1);
              return fallbackUpdateFn();
            }
          }
        });
        if (fallback) {
          if (context[0] === 1) {
            context[1] = true;
          } else {
            build(context, errorHandlerNode, [fallback]);
            if ((errorHandler.length === 1 || context !== errorHandlerContext) && errorHandlerNode.c) {
              apply(errorHandlerNode, errorHandlerNode.c);
              return;
            }
          }
          throw cancelBuild;
        }
      }
      throw e;
    } finally {
      if (foundErrorHandler) {
        context[5].pop();
      }
    }
  };
  var buildNode = (node) => {
    if (node === void 0 || node === null || typeof node === "boolean") {
      return void 0;
    } else if (typeof node === "string" || typeof node === "number") {
      return { t: node.toString(), d: true };
    } else {
      if ("vR" in node) {
        node = newJSXNode({
          tag: node.tag,
          props: node.props,
          key: node.key,
          f: node.f
        });
      }
      if (typeof node.tag === "function") {
        ;
        node[DOM_STASH] = [0, []];
      } else {
        const ns = nameSpaceMap[node.tag];
        if (ns) {
          nameSpaceContext2 ||= createContext("");
          node.props.children = [
            {
              tag: nameSpaceContext2,
              props: {
                value: node.n = `http://www.w3.org/${ns}`,
                children: node.props.children
              }
            }
          ];
        }
      }
      return node;
    }
  };
  var replaceContainer = (node, from, to) => {
    if (node.c === from) {
      node.c = to;
      node.vC.forEach((child) => replaceContainer(child, from, to));
    }
  };
  var updateSync = (context, node) => {
    node[DOM_STASH][2]?.forEach(([c, v]) => {
      c.values.push(v);
    });
    try {
      build(context, node, void 0);
    } catch (e) {
      return;
    }
    if (node.a) {
      delete node.a;
      return;
    }
    node[DOM_STASH][2]?.forEach(([c]) => {
      c.values.pop();
    });
    if (context[0] !== 1 || !context[1]) {
      apply(node, node.c);
    }
  };
  var updateMap = /* @__PURE__ */ new WeakMap();
  var currentUpdateSets = [];
  var update = async (context, node) => {
    context[5] ||= [];
    const existing = updateMap.get(node);
    if (existing) {
      existing[0](void 0);
    }
    let resolve;
    const promise = new Promise((r) => resolve = r);
    updateMap.set(node, [
      resolve,
      () => {
        if (context[2]) {
          context[2](context, node, (context2) => {
            updateSync(context2, node);
          }).then(() => resolve(node));
        } else {
          updateSync(context, node);
          resolve(node);
        }
      }
    ]);
    if (currentUpdateSets.length) {
      ;
      currentUpdateSets.at(-1).add(node);
    } else {
      await Promise.resolve();
      const latest = updateMap.get(node);
      if (latest) {
        updateMap.delete(node);
        latest[1]();
      }
    }
    return promise;
  };
  var renderNode = (node, container) => {
    const context = [];
    context[5] = [];
    context[4] = true;
    build(context, node, void 0);
    context[4] = false;
    const fragment = document.createDocumentFragment();
    apply(node, fragment);
    replaceContainer(node, fragment, container);
    container.replaceChildren(fragment);
  };
  var render = (jsxNode, container) => {
    renderNode(buildNode({ tag: "", props: { children: jsxNode } }), container);
  };
  var createPortal = (children, container, key) => ({
    tag: HONO_PORTAL_ELEMENT,
    props: {
      children
    },
    key,
    e: container,
    p: 1
  });

  // node_modules/hono/dist/jsx/hooks/index.js
  var STASH_SATE = 0;
  var STASH_EFFECT = 1;
  var STASH_CALLBACK = 2;
  var STASH_MEMO = 3;
  var resolvedPromiseValueMap = /* @__PURE__ */ new WeakMap();
  var isDepsChanged = (prevDeps, deps) => !prevDeps || !deps || prevDeps.length !== deps.length || deps.some((dep, i) => dep !== prevDeps[i]);
  var updateHook = void 0;
  var pendingStack = [];
  var useState = (initialState) => {
    const resolveInitialState = () => typeof initialState === "function" ? initialState() : initialState;
    const buildData = buildDataStack.at(-1);
    if (!buildData) {
      return [resolveInitialState(), () => {
      }];
    }
    const [, node] = buildData;
    const stateArray = node[DOM_STASH][1][STASH_SATE] ||= [];
    const hookIndex = node[DOM_STASH][0]++;
    return stateArray[hookIndex] ||= [
      resolveInitialState(),
      (newState) => {
        const localUpdateHook = updateHook;
        const stateData = stateArray[hookIndex];
        if (typeof newState === "function") {
          newState = newState(stateData[0]);
        }
        if (!Object.is(newState, stateData[0])) {
          stateData[0] = newState;
          if (pendingStack.length) {
            const [pendingType, pendingPromise] = pendingStack.at(-1);
            Promise.all([
              pendingType === 3 ? node : update([pendingType, false, localUpdateHook], node),
              pendingPromise
            ]).then(([node2]) => {
              if (!node2 || !(pendingType === 2 || pendingType === 3)) {
                return;
              }
              const lastVC = node2.vC;
              const addUpdateTask = () => {
                setTimeout(() => {
                  if (lastVC !== node2.vC) {
                    return;
                  }
                  update([pendingType === 3 ? 1 : 0, false, localUpdateHook], node2);
                });
              };
              requestAnimationFrame(addUpdateTask);
            });
          } else {
            update([0, false, localUpdateHook], node);
          }
        }
      }
    ];
  };
  var useCallback = (callback, deps) => {
    const buildData = buildDataStack.at(-1);
    if (!buildData) {
      return callback;
    }
    const [, node] = buildData;
    const callbackArray = node[DOM_STASH][1][STASH_CALLBACK] ||= [];
    const hookIndex = node[DOM_STASH][0]++;
    const prevDeps = callbackArray[hookIndex];
    if (isDepsChanged(prevDeps?.[1], deps)) {
      callbackArray[hookIndex] = [callback, deps];
    } else {
      callback = callbackArray[hookIndex][0];
    }
    return callback;
  };
  var use = (promise) => {
    const cachedRes = resolvedPromiseValueMap.get(promise);
    if (cachedRes) {
      if (cachedRes.length === 2) {
        throw cachedRes[1];
      }
      return cachedRes[0];
    }
    promise.then(
      (res) => resolvedPromiseValueMap.set(promise, [res]),
      (e) => resolvedPromiseValueMap.set(promise, [void 0, e])
    );
    throw promise;
  };
  var useMemo = (factory, deps) => {
    const buildData = buildDataStack.at(-1);
    if (!buildData) {
      return factory();
    }
    const [, node] = buildData;
    const memoArray = node[DOM_STASH][1][STASH_MEMO] ||= [];
    const hookIndex = node[DOM_STASH][0]++;
    const prevDeps = memoArray[hookIndex];
    if (isDepsChanged(prevDeps?.[1], deps)) {
      memoArray[hookIndex] = [factory(), deps];
    }
    return memoArray[hookIndex][0];
  };

  // node_modules/hono/dist/jsx/dom/hooks/index.js
  var FormContext = createContext({
    pending: false,
    data: null,
    method: null,
    action: null
  });
  var actions = /* @__PURE__ */ new Set();
  var registerAction = (action) => {
    actions.add(action);
    action.finally(() => actions.delete(action));
  };

  // node_modules/hono/dist/jsx/dom/intrinsic-element/components.js
  var composeRef = (ref, cb) => {
    return useMemo(
      () => (e) => {
        let refCleanup;
        if (ref) {
          if (typeof ref === "function") {
            refCleanup = ref(e) || (() => {
              ref(null);
            });
          } else if (ref && "current" in ref) {
            ref.current = e;
            refCleanup = () => {
              ref.current = null;
            };
          }
        }
        const cbCleanup = cb(e);
        return () => {
          cbCleanup?.();
          refCleanup?.();
        };
      },
      [ref]
    );
  };
  var blockingPromiseMap = /* @__PURE__ */ Object.create(null);
  var createdElements = /* @__PURE__ */ Object.create(null);
  var documentMetadataTag2 = (tag, props, preserveNodeType, supportSort, supportBlocking) => {
    if (props?.itemProp) {
      return newJSXNode({
        tag,
        props
      });
    }
    const head = document.head;
    let { onLoad, onError, precedence, blocking, ...restProps } = props;
    let element = null;
    let created = false;
    const deDupeKeys = deDupeKeyMap[tag];
    let existingElements = void 0;
    if (deDupeKeys.length > 0) {
      const tags = head.querySelectorAll(tag);
      LOOP:
        for (const e of tags) {
          for (const key of deDupeKeyMap[tag]) {
            if (e.getAttribute(key) === props[key]) {
              element = e;
              break LOOP;
            }
          }
        }
      if (!element) {
        const cacheKey = deDupeKeys.reduce(
          (acc, key) => props[key] === void 0 ? acc : `${acc}-${key}-${props[key]}`,
          tag
        );
        created = !createdElements[cacheKey];
        element = createdElements[cacheKey] ||= (() => {
          const e = document.createElement(tag);
          for (const key of deDupeKeys) {
            if (props[key] !== void 0) {
              e.setAttribute(key, props[key]);
            }
            if (props.rel) {
              e.setAttribute("rel", props.rel);
            }
          }
          return e;
        })();
      }
    } else {
      existingElements = head.querySelectorAll(tag);
    }
    precedence = supportSort ? precedence ?? "" : void 0;
    if (supportSort) {
      restProps[dataPrecedenceAttr] = precedence;
    }
    const insert = useCallback(
      (e) => {
        if (deDupeKeys.length > 0) {
          let found = false;
          for (const existingElement of head.querySelectorAll(tag)) {
            if (found && existingElement.getAttribute(dataPrecedenceAttr) !== precedence) {
              head.insertBefore(e, existingElement);
              return;
            }
            if (existingElement.getAttribute(dataPrecedenceAttr) === precedence) {
              found = true;
            }
          }
          head.appendChild(e);
        } else if (existingElements) {
          let found = false;
          for (const existingElement of existingElements) {
            if (existingElement === e) {
              found = true;
              break;
            }
          }
          if (!found) {
            head.insertBefore(
              e,
              head.contains(existingElements[0]) ? existingElements[0] : head.querySelector(tag)
            );
          }
          existingElements = void 0;
        }
      },
      [precedence]
    );
    const ref = composeRef(props.ref, (e) => {
      const key = deDupeKeys[0];
      if (preserveNodeType === 2) {
        e.innerHTML = "";
      }
      if (created || existingElements) {
        insert(e);
      }
      if (!onError && !onLoad) {
        return;
      }
      let promise = blockingPromiseMap[e.getAttribute(key)] ||= new Promise(
        (resolve, reject) => {
          e.addEventListener("load", resolve);
          e.addEventListener("error", reject);
        }
      );
      if (onLoad) {
        promise = promise.then(onLoad);
      }
      if (onError) {
        promise = promise.catch(onError);
      }
      promise.catch(() => {
      });
    });
    if (supportBlocking && blocking === "render") {
      const key = deDupeKeyMap[tag][0];
      if (props[key]) {
        const value = props[key];
        const promise = blockingPromiseMap[value] ||= new Promise((resolve, reject) => {
          insert(element);
          element.addEventListener("load", resolve);
          element.addEventListener("error", reject);
        });
        use(promise);
      }
    }
    const jsxNode = newJSXNode({
      tag,
      props: {
        ...restProps,
        ref
      }
    });
    jsxNode.p = preserveNodeType;
    if (element) {
      jsxNode.e = element;
    }
    return createPortal(
      jsxNode,
      head
    );
  };
  var title2 = (props) => {
    const nameSpaceContext3 = getNameSpaceContext2();
    const ns = nameSpaceContext3 && useContext(nameSpaceContext3);
    if (ns?.endsWith("svg")) {
      return newJSXNode({
        tag: "title",
        props
      });
    }
    return documentMetadataTag2("title", props, void 0, false, false);
  };
  var script2 = (props) => {
    if (!props || ["src", "async"].some((k) => !props[k])) {
      return newJSXNode({
        tag: "style",
        props
      });
    }
    return documentMetadataTag2("script", props, 1, false, true);
  };
  var style2 = (props) => {
    if (!props || !["href", "precedence"].every((k) => k in props)) {
      return newJSXNode({
        tag: "style",
        props
      });
    }
    props["data-href"] = props.href;
    delete props.href;
    return documentMetadataTag2("style", props, 2, true, true);
  };
  var link2 = (props) => {
    if (!props || ["onLoad", "onError"].some((k) => k in props) || props.rel === "stylesheet" && (!("precedence" in props) || "disabled" in props)) {
      return newJSXNode({
        tag: "link",
        props
      });
    }
    return documentMetadataTag2("link", props, 1, "precedence" in props, true);
  };
  var meta2 = (props) => {
    return documentMetadataTag2("meta", props, void 0, false, false);
  };
  var customEventFormAction = Symbol();
  var form2 = (props) => {
    const { action, ...restProps } = props;
    if (typeof action !== "function") {
      ;
      restProps.action = action;
    }
    const [state, setState] = useState([null, false]);
    const onSubmit = useCallback(
      async (ev) => {
        const currentAction = ev.isTrusted ? action : ev.detail[customEventFormAction];
        if (typeof currentAction !== "function") {
          return;
        }
        ev.preventDefault();
        const formData = new FormData(ev.target);
        setState([formData, true]);
        const actionRes = currentAction(formData);
        if (actionRes instanceof Promise) {
          registerAction(actionRes);
          await actionRes;
        }
        setState([null, true]);
      },
      []
    );
    const ref = composeRef(props.ref, (el) => {
      el.addEventListener("submit", onSubmit);
      return () => {
        el.removeEventListener("submit", onSubmit);
      };
    });
    const [data, isDirty] = state;
    state[1] = false;
    return newJSXNode({
      tag: FormContext,
      props: {
        value: {
          pending: data !== null,
          data,
          method: data ? "post" : null,
          action: data ? action : null
        },
        children: newJSXNode({
          tag: "form",
          props: {
            ...restProps,
            ref
          }
        })
      },
      f: isDirty
    });
  };
  var formActionableElement2 = (tag, {
    formAction,
    ...props
  }) => {
    if (typeof formAction === "function") {
      const onClick = useCallback((ev) => {
        ev.preventDefault();
        ev.currentTarget.form.dispatchEvent(
          new CustomEvent("submit", { detail: { [customEventFormAction]: formAction } })
        );
      }, []);
      props.ref = composeRef(props.ref, (el) => {
        el.addEventListener("click", onClick);
        return () => {
          el.removeEventListener("click", onClick);
        };
      });
    }
    return newJSXNode({
      tag,
      props
    });
  };
  var input2 = (props) => formActionableElement2("input", props);
  var button2 = (props) => formActionableElement2("button", props);
  Object.assign(domRenderers, {
    title: title2,
    script: script2,
    style: style2,
    link: link2,
    meta: meta2,
    form: form2,
    input: input2,
    button: button2
  });

  // src/web-components/hello-world/custom-element.ts
  var HelloWorldCE = class extends HTMLElement {
    // 3.2. Custom Elementの持つ機能を`connectedCallback`メソッド内で実装
    connectedCallback() {
      const button3 = this.shadowRoot?.querySelector("button");
      button3?.addEventListener("click", () => alert("Hello, World!"));
    }
  };

  // node_modules/hono/dist/jsx/jsx-dev-runtime.js
  function jsxDEV2(tag, props, key) {
    let node;
    if (!props || !("children" in props)) {
      node = jsxFn(tag, props, []);
    } else {
      const children = props.children;
      node = Array.isArray(children) ? jsxFn(tag, props, children) : jsxFn(tag, props, [children]);
    }
    node.key = key;
    return node;
  }

  // src/web-components/hello-world/shadow-dom.tsx
  var HelloWorldDsdButton = ({ label }) => {
    return /* @__PURE__ */ jsxDEV2("hello-world-button", { children: /* @__PURE__ */ jsxDEV2(
      "template",
      {
        shadowrootmode: "open",
        dangerouslySetInnerHTML: {
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
        `
        }
      }
    ) });
  };

  // src/client/index.tsx
  customElements.define("hello-world-button", HelloWorldCE);
  var SetHtmlUnsafeDSDAddButton = () => {
    const handleAddDsd = () => {
      const tempDiv = document.createElement("div");
      tempDiv.setHTMLUnsafe(
        HelloWorldDsdButton({ label: "I'm DSD Button" }).toString()
      );
      document.body.appendChild(tempDiv.getElementsByTagName("hello-world")[0]);
    };
    return /* @__PURE__ */ jsxDEV2("button", { type: "button", onClick: handleAddDsd, children: "Add Say DSD!(setHTMLUnsafe)" });
  };
  var InnerHtmlDSDAddButton = () => {
    const handleAddDsd = () => {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = HelloWorldDsdButton({
        label: "I'm DSD Button"
      }).toString();
      document.body.appendChild(tempDiv.getElementsByTagName("hello-world")[0]);
    };
    return /* @__PURE__ */ jsxDEV2("button", { type: "button", onClick: handleAddDsd, children: "Add Say DSD!(innerHTML)" });
  };
  function ClientApp() {
    return /* @__PURE__ */ jsxDEV2(Fragment, { children: [
      /* @__PURE__ */ jsxDEV2("h2", { children: "\u2193Under Here is generated after Hydration!\u2193" }),
      /* @__PURE__ */ jsxDEV2(SetHtmlUnsafeDSDAddButton, {}),
      /* @__PURE__ */ jsxDEV2(InnerHtmlDSDAddButton, {})
    ] });
  }
  var root = document.getElementById("root");
  if (root) {
    render(/* @__PURE__ */ jsxDEV2(ClientApp, {}), root);
  } else {
    console.error("root element not found");
  }
})();
