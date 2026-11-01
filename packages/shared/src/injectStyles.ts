export function injectStyles(styles: TemplateStringsArray) {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles.join('');
  document.head.appendChild(styleElement);
}

export const css = injectStyles;
