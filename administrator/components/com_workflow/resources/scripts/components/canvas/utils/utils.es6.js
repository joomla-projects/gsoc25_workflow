export function createSpecialNode(id, position, color, title, selectStage, isTransitionMode) {
  return {
    id,
    type: 'stage',
    position,
    data: {
      stage: { id, title, color, published: 1, special: true },
      isSelected: false,
      onSelect: () => selectStage(id),
      isSpecial: true,
    },
    draggable: !isTransitionMode
  }
}

export function getColorForStage(stage) {
  const hue = (parseInt(stage?.id) * 137) % 360
  return `hsl(${hue}, 70%, 85%)`
}

export function getColorForTransition(transition) {
  const hue = (parseInt(transition?.id) * 199) % 360
  return `hsl(${hue}, 70%, 60%)`
}

export function getEdgeColor(transition, isSelected) {
  if (isSelected) return '#3B82F6'
  if (transition?.published) return getColorForTransition(transition)
  return (transition.from_stage_id === -1 || transition.to_stage_id === -1) ? '#F97316' : '#10B981'
}

export function announce(liveRegionRef, message) {
  if (liveRegionRef) {
    liveRegionRef.textContent = message;
  }
}

export function debounce(func, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}
