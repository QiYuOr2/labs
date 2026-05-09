export function createMemoryLiveStateStore(initialState = null) {
  let state = initialState;

  return {
    async read() {
      return state;
    },

    async write(nextState) {
      state = nextState;
      return state;
    }
  };
}
