const BLOCKED_TOKEN = "tidio";
const INSTALL_FLAG = "__ENISRA_TIDIO_BLOCKER_INSTALLED__";

const hasBlockedValue = (value) =>
  typeof value === "string" && value.toLowerCase().includes(BLOCKED_TOKEN);

const getTextValue = (value) => (typeof value === "string" ? value : "");

const isElementNode = (node) => Boolean(node) && node.nodeType === 1;

const getNodeClassName = (node) =>
  typeof node?.className === "string" ? node.className : "";

const isBlockedNode = (node) => {
  if (!isElementNode(node)) {
    return false;
  }

  const title = getTextValue(node.getAttribute?.("title"));
  const id = getTextValue(node.id);
  const className = getNodeClassName(node);
  const src = getTextValue(node.getAttribute?.("src")) || getTextValue(node.src);
  const href = getTextValue(node.getAttribute?.("href")) || getTextValue(node.href);

  return [title, id, className, src, href].some(hasBlockedValue);
};

const removeBlockedTree = (rootNode) => {
  if (!isElementNode(rootNode)) {
    return;
  }

  if (isBlockedNode(rootNode)) {
    rootNode.remove();
    return;
  }

  rootNode
    .querySelectorAll('script, link, iframe, div, button')
    .forEach((node) => {
      if (isBlockedNode(node)) {
        node.remove();
      }
    });
};

const patchNodeInsertion = () => {
  const appendChild = Node.prototype.appendChild;
  const insertBefore = Node.prototype.insertBefore;
  const replaceChild = Node.prototype.replaceChild;
  const append = Element.prototype.append;

  Node.prototype.appendChild = function patchedAppendChild(child) {
    if (isBlockedNode(child)) {
      return child;
    }

    return appendChild.call(this, child);
  };

  Node.prototype.insertBefore = function patchedInsertBefore(newNode, referenceNode) {
    if (isBlockedNode(newNode)) {
      return newNode;
    }

    return insertBefore.call(this, newNode, referenceNode);
  };

  Node.prototype.replaceChild = function patchedReplaceChild(newChild, oldChild) {
    if (isBlockedNode(newChild)) {
      oldChild?.remove?.();
      return oldChild;
    }

    return replaceChild.call(this, newChild, oldChild);
  };

  Element.prototype.append = function patchedAppend(...nodes) {
    const allowedNodes = nodes.filter((node) => !isBlockedNode(node));

    if (allowedNodes.length === 0) {
      return undefined;
    }

    return append.call(this, ...allowedNodes);
  };
};

const patchAttributeSetters = () => {
  const setAttribute = Element.prototype.setAttribute;

  Element.prototype.setAttribute = function patchedSetAttribute(name, value) {
    const normalizedName = getTextValue(name).toLowerCase();

    if ((normalizedName === "src" || normalizedName === "href") && hasBlockedValue(value)) {
      this.remove();
      return undefined;
    }

    return setAttribute.call(this, name, value);
  };
};

const patchUrlProperty = (ConstructorRef, propertyName) => {
  if (!ConstructorRef?.prototype) {
    return;
  }

  const descriptor = Object.getOwnPropertyDescriptor(ConstructorRef.prototype, propertyName);
  if (!descriptor?.set || !descriptor?.get) {
    return;
  }

  try {
    Object.defineProperty(ConstructorRef.prototype, propertyName, {
      configurable: true,
      enumerable: descriptor.enumerable ?? true,
      get: descriptor.get,
      set(value) {
        if (hasBlockedValue(value)) {
          this.remove();
          return;
        }

        descriptor.set.call(this, value);
      },
    });
  } catch {
    return;
  }
};

const patchUrlProperties = () => {
  patchUrlProperty(window.HTMLScriptElement, "src");
  patchUrlProperty(window.HTMLLinkElement, "href");
  patchUrlProperty(window.HTMLIFrameElement, "src");
};

const clearTidioGlobals = () => {
  const globalNames = [
    "tidioChatApi",
    "tidioChatCode",
    "tidioIdentify",
    "tidioVisitor",
    "TidioChatApi",
  ];

  globalNames.forEach((name) => {
    if (!(name in window)) {
      return;
    }

    try {
      delete window[name];
    } catch {
      window[name] = undefined;
    }
  });
};

const observeDom = () => {
  if (!document.documentElement) {
    return;
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes") {
        removeBlockedTree(mutation.target);
        return;
      }

      mutation.addedNodes.forEach((node) => {
        removeBlockedTree(node);
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src", "href", "id", "class", "title"],
  });
};

export const installTidioBlocker = () => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  if (window[INSTALL_FLAG]) {
    return;
  }

  window[INSTALL_FLAG] = true;

  clearTidioGlobals();
  patchNodeInsertion();
  patchAttributeSetters();
  patchUrlProperties();
  removeBlockedTree(document.documentElement);
  observeDom();

  document.addEventListener("DOMContentLoaded", () => {
    clearTidioGlobals();
    removeBlockedTree(document.documentElement);
  });

  window.addEventListener("load", () => {
    clearTidioGlobals();
    removeBlockedTree(document.documentElement);
  });
};
