import assert from 'node:assert/strict';
import { constrainPosition, dockScale } from '../dist/assets/desktop-math.mjs';

// Removing boundary checks would strand a widget outside the desktop.
assert.deepEqual(constrainPosition({x:-90,y:900,width:180,height:160},{width:1000,height:700}),{x:16,y:524});
assert.deepEqual(constrainPosition({x:240,y:120,width:180,height:160},{width:1000,height:700}),{x:240,y:120});
// A resize must bring a previously valid position back into view.
assert.deepEqual(constrainPosition({x:820,y:520,width:180,height:160},{width:760,height:500}),{x:564,y:324});
// Proximity magnifies neighbors and leaves distant icons at their normal size.
assert.ok(dockScale(0)>dockScale(40));
assert.ok(dockScale(40)>1);
assert.equal(dockScale(-40),dockScale(40));
assert.equal(dockScale(1000),1);
console.log('Desktop boundaries, resize recovery, and dock proximity passed.');
