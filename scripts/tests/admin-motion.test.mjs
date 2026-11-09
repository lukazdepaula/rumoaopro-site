import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function setup(reduced=false) {
  const classes=new Set();
  const element={classList:{add:value=>classes.add(value),remove:value=>classes.delete(value)}};
  const state={observed:0,unobserved:0,disconnected:0,removed:0};
  const preference={matches:reduced,addEventListener:(_,callback)=>state.preferenceChange=callback,
    removeEventListener:()=>state.removed++};
  class Observer {
    constructor(callback){state.intersect=callback;}
    observe(){state.observed++;}
    unobserve(){state.unobserved++;}
    disconnect(){state.disconnected++;}
  }
  const mod={exports:{}};
  vm.runInNewContext(ts.transpileModule(readFileSync('lib/admin-motion.ts','utf8'),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}
  }).outputText,{exports:mod.exports,module:mod,document:{querySelectorAll:()=>[element]},
    window:{matchMedia:()=>preference,IntersectionObserver:Observer},IntersectionObserver:Observer});
  const cleanup=mod.exports.observeAdminMotion();
  return {classes,state,preference,element,cleanup};
}
test('charts reveal once on entering the viewport and clean up observers',()=>{
  const {classes,state,element,cleanup}=setup();
  assert.equal(classes.has('admin-motion-pending'),true);
  state.intersect([{target:element,isIntersecting:true}]);
  assert.equal(classes.has('admin-motion-pending'),false);
  assert.equal(state.unobserved,1);
  cleanup();
  assert.equal(state.removed,1);
  assert.equal(state.disconnected,1);
});
test('reduced motion never hides the final graphic, including preference changes while open',()=>{
  const reduced=setup(true);
  assert.equal(reduced.classes.size,0);
  assert.equal(reduced.state.observed,0);
  reduced.cleanup();
  const changed=setup(false);
  changed.preference.matches=true;
  changed.state.preferenceChange();
  assert.equal(changed.classes.size,0);
  assert.equal(changed.state.disconnected,1);
  changed.cleanup();
});
