type Callback = (item: Element) => void;

export function findAndEditElement(selector: string, callback: Callback) {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) {
    setTimeout(() => findAndRemoveElement(selector), 500);
  } else {
    elements.forEach((item) => callback(item));
  }
}

export function findAndRemoveElement(selector: string) {
  findAndEditElement(selector, (item) => item.remove());
}
