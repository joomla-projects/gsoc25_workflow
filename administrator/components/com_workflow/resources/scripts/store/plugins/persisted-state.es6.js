export default function createPersistedState(options = {}) {
  const config = {
    storage: window.sessionStorage,
    key: options.key || 'joomla.workflow',
    paths: options.paths || [],
    ...options
  };

  return (store) => {
    // Load saved state from storage when initializing
    try {
      const savedState = config.storage.getItem(config.key);
      if (savedState) {
        const data = JSON.parse(savedState);
        store.replaceState({
          ...store.state,
          ...data
        });
      }
    } catch (err) {
      console.warn('Error loading persisted state:', err);
    }

    // Save state changes to storage
    store.subscribe((mutation, state) => {
      try {
        // Filter state if paths are specified or use a reducer
        let persistedState = state;

        if (typeof config.reducer === 'function') {
          persistedState = config.reducer(state);
        } else if (config.paths && config.paths.length) {
          persistedState = config.paths.reduce((result, path) => {
            if (state[path]) {
              result[path] = state[path];
            }
            return result;
          }, {});
        }

        config.storage.setItem(
          config.key,
          JSON.stringify(persistedState)
        );
      } catch (err) {
        console.warn('Error saving state:', err);
      }
    });
  };
}
