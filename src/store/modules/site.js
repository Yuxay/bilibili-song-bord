export default {
  namespaced: true,
  state: {
    label: null,
    value: null,
    tags: null
  },
  mutations: {
    updateLabel(state, label) {
      state.label = label;
    },
    updateValue(state, value) {
      state.value = value;
    },
    updateTags(state, tags) {
      state.tags = tags;
    }
  }
};
