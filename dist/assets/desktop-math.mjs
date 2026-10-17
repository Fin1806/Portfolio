export function constrainPosition({x,y,width,height}, board, inset=16) {
  return {
    x: Math.max(inset, Math.min(x, Math.max(inset, board.width-width-inset))),
    y: Math.max(inset, Math.min(y, Math.max(inset, board.height-height-inset)))
  };
}

export function dockScale(distance, reach=112) {
  return 1 + 0.42 * Math.max(0, 1-Math.abs(distance)/reach)**2;
}
