  import { announce, cycleFocus, cycleMode } from './focus-utils.es6';

/**
 * Attach global keyboard listeners for workflow canvas.
 * @param {Object} options
 * @param {Function} addStage
 * @param {Function} addTransition
 * @param {Function} editItem
 * @param {Function} deleteItem
 * @param {Function} toggleMode
 * @param {Function} undo
 * @param {Function} redo
 *
 * @param {Function} clearSelection
 * @param {Function} zoomIn
 * @param {Function} zoomOut
 *
 * @param {Object} state - { selectedStage, selectedTransition, isTransitionMode, liveRegion }
 */
export function setupGlobalShortcuts({ addStage, addTransition, editItem, deleteItem,
                                       toggleMode, undo, redo, updateSaveMessage,
                                       saveNodePosition, clearSelection, zoomIn,
                                       zoomOut, fitView, viewport, state, setSaveStatus, store
                                     }) {

  function isModifierPressed(e, key) {
    return (e.ctrlKey || e.metaKey) && [key.toLowerCase(), key.toUpperCase()].includes(e.key);
  }
  function handleKey(e) {
    const iframe = document.querySelector('joomla-dialog dialog[open]');
    if (iframe) {
      if (e.key === 'Escape') {
        e.preventDefault();
        iframe.close();
        return;
      }
      return;
    }
    switch (true) {
      case e.altKey && ['n', 'N'].includes(e.key):
        e.preventDefault();
        addStage();
        announce(state.liveRegion, 'Add stage');
        break;

      case e.altKey && ['m', 'M'].includes(e.key):
        e.preventDefault();
        addTransition();
        announce(state.liveRegion, 'Add transition');
        break;

      case e.altKey && ['u', 'U'].includes(e.key):
        e.preventDefault();
        editItem();
        break;

      case e.altKey && e.shiftKey && ['d', 'D'].includes(e.key):
        e.preventDefault();
        deleteItem();
        break;

      case e.altKey && ['c', 'C'].includes(e.key):
        e.preventDefault();
        toggleMode();
        break;

      case isModifierPressed(e, 'z'):
        e.preventDefault();
        undo();
        break;

      case isModifierPressed(e, 'y'):
        e.preventDefault();
        redo();
        break;

      case e.key === 'Escape':
        e.preventDefault();
        clearSelection();
        break;

      case ['+', '='].includes(e.key):
        e.preventDefault();
        zoomIn();
        break;

      case ['-', '_'].includes(e.key):
        e.preventDefault();
        zoomOut();
        break;

      case ['f', 'F'].includes(e.key):
        e.preventDefault()
        fitView();
        break;

      case e.key === 'Tab':
        e.preventDefault();
        cycleMode(['stages', 'transitions', 'toolbar', 'actions', 'links', 'buttons'], state.currentFocusMode, state.liveRegion);
        break;

      case ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key):
        e.preventDefault();
        if (state.selectedStage.value) {
          moveNode(state.selectedStage.value.toString(), e.key, e.shiftKey);
        }else if(e.shiftKey){
          const panStep = 20;
          switch (e.key) {
            case 'ArrowUp': viewport.value.y += panStep; break;
            case 'ArrowDown': viewport.value.y -= panStep; break;
            case 'ArrowLeft': viewport.value.x += panStep; break;
            case 'ArrowRight': viewport.value.x -= panStep; break;
          }
        }else{
          const reverse = ['ArrowLeft', 'ArrowUp'].includes(e.key);
          const groupSelectors = {
            stages: '.stage-node[tabindex="0"]',
            transitions: '.edge-label[tabindex="0"]',
            toolbar: '.toolbar-button[tabindex="0"]',
            actions: '.action-button[tabindex="0"]',
            links: 'a[href][tabindex="0"], a[href]:not([tabindex="-1"])',
            buttons: 'button[tabindex="0"], button:not([tabindex="-1"])'
          };
          const selector = groupSelectors[state.currentFocusMode.value];
          if (selector) {
            cycleFocus(selector, reverse);
          }          break;
        }
        break;
    }
  }

  function moveNode(stageId, direction, fast = false) {
    const el = document.querySelector(`.stage-node[data-stage-id='${stageId}']`);
    if (!el) return;

    const moveBy = fast ? 20 : 5;
    if (!store) return;

    const stageIndex = store.getters.stages.findIndex(s => s.id === parseInt(stageId));
    if (stageIndex === -1) return;
    const currentPosition = store.getters.stages[stageIndex].position || { x: 0, y: 0 };
    if (!currentPosition) return;

    let newX = currentPosition.x;
    let newY = currentPosition.y;

    switch (direction) {
      case 'ArrowUp': newY -= moveBy; break;
      case 'ArrowDown': newY += moveBy; break;
      case 'ArrowLeft': newX -= moveBy; break;
      case 'ArrowRight': newX += moveBy; break;
    }

    store.dispatch('updateStagePosition', { id: stageId, x: newX, y: newY });
    setSaveStatus('unsaved');
    updateSaveMessage();
    saveNodePosition();
  }

  document.addEventListener('keydown', handleKey);

  return () => {
    document.removeEventListener('keydown', handleKey);
  };
}
