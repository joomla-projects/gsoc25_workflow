/**
 * Announce a message via ARIA live region.
 * @param {HTMLElement} liveRegionElement
 * @param {string} message
 */
export function announce(liveRegionElement, message) {
  if (!liveRegionElement || !message) return;
  liveRegionElement.textContent = '';
  setTimeout(() => {
    liveRegionElement.textContent = message;
  }, 10);
}

/**
 * Focus a stage node by stageId.
 * @param {string|number} stageId
 */
export function focusNode(stageId) {
  const el = document.querySelector(`.stage-node[data-stage-id='${stageId}']`);
  if (el) el.focus();
}

/**
 * Focus an edge label by transitionId.
 * @param {string|number} transitionId
 */
export function focusEdge(transitionId) {
  const el = document.querySelector(`.edge-label[data-edge-id='${transitionId}']`);
  if (el) el.focus();
}

/**
 * Find and cycle focus among elements with a selector.
 * @param {string} selector
 * @param {boolean} reverse
 */
export function cycleFocus(selector, reverse = false) {
  const elements = Array.from(document.querySelectorAll(selector));
  if (!elements.length) return;
  const currentIndex = elements.indexOf(document.activeElement);
  let nextIndex;
  if (reverse) {
    nextIndex = currentIndex <= 0 ? elements.length - 1 : currentIndex - 1;
  } else {
    nextIndex = currentIndex >= elements.length - 1 ? 0 : currentIndex + 1;
  }
  elements[nextIndex].focus();
}

/**
 *
 *
 */
export function setupDialogFocusHandlers(previouslyFocusedElement) {
  setTimeout(() => {
    const dialog = document.querySelector('joomla-dialog dialog[open]');
    if (dialog) {
      dialog.focus();
      const iframe = dialog.querySelector('iframe');
      if (iframe) {
        iframe.addEventListener('load', () => {
          handleDialogIframeLoad(iframe);
        });
      }
      dialog.addEventListener('close', handleDialogClose);
      dialog.addEventListener('keydown', handleDialogKeydown);
    }
  }, 100);
}
function handleDialogIframeLoad(iframe) {
  try {
    iframe.focus();
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (iframeDoc) {
      const firstInput = iframeDoc.querySelector('input:not([type="hidden"]), select, textarea');
      if (firstInput) {
        firstInput.focus();
      } else {
        iframeDoc.body.focus();
      }
    }
  } catch (error) {
    iframe.focus();
  }
}

function handleDialogClose(previouslyFocusedElement) {
  if (previouslyFocusedElement.value) {
    nextTick(() => {
      previouslyFocusedElement.value.focus();
      previouslyFocusedElement.value = null;
    });
  }
}
function handleDialogKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    const dialog = e.currentTarget;
    if (dialog && dialog.close) {
      dialog.close();
    }
  }
}
