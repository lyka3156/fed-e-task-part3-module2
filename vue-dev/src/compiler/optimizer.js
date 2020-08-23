/* @flow */

import { makeMap, isBuiltInTag, cached, no } from 'shared/util'

let isStaticKey
let isPlatformReservedTag

const genStaticKeysCached = cached(genStaticKeys)

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */
// 优化的是静态节点(永远不会更改的节点)
// 提升为常量，重新渲染的时候不在重新创建节点
// 在 patch 的时候直接跳过静态子树
export function optimize(root: ?ASTElement, options: CompilerOptions) {
  // 没有传递ast直接返回
  if (!root) return
  isStaticKey = genStaticKeysCached(options.staticKeys || '')
  isPlatformReservedTag = options.isReservedTag || no
  // first pass: mark all non-static nodes.
  // 1. 标记静态节点
  markStatic(root)
  // second pass: mark static roots.
  // 2. 标记静态根节点
  markStaticRoots(root, false)
}

function genStaticKeys(keys: string): Function {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
    (keys ? ',' + keys : '')
  )
}

// 标记静态节点
function markStatic(node: ASTNode) {
  // 判断当前 astNode 是否是静态的
  node.static = isStatic(node)
  // 元素节点
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
    // 是组件，不是 sloat,没有inline-template
    // 就不做处理
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
      return
    }
    // 遍历 children 
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      // 递归调用标记静态
      markStatic(child)
      if (!child.static) {
        // 如果有一个 child 不是 static节点，当前 node 不是static节点
        node.static = false
      }
    }
    // 遍历条件下的子节点
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block
        markStatic(block)
        if (!block.static) {
          node.static = false
        }
      }
    }
  }
}
// 标记静态根节点
function markStaticRoots(node: ASTNode, isInFor: boolean) {
  // 是否是元素
  if (node.type === 1) {
    // 是否是静态的，或者是否是只渲染一次
    if (node.static || node.once) {
      node.staticInFor = isInFor
    }
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    // 如果一个元素内只有文本节点，此时这个元素不是静态的Root
    // Vue 认为这种优化会带来负面的影响
    if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      node.staticRoot = true
      return
    } else {
      node.staticRoot = false
    }
    // 检查当前节点的子节点是否有静态的Root
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for)
      }
    }
    // 遍历条件下的子节点
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        markStaticRoots(node.ifConditions[i].block, isInFor)
      }
    }
  }
}

// 是否是静态节点
function isStatic(node: ASTNode): boolean {
  // 表达式
  if (node.type === 2) { // expression
    return false
  }
  // 静态的文本内容
  if (node.type === 3) { // text
    return true
  }
  return !!(node.pre || (
    !node.hasBindings && // no dynamic bindings
    !node.if && !node.for && // not v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // not a built-in
    isPlatformReservedTag(node.tag) && // not a component
    !isDirectChildOfTemplateFor(node) &&  // 不能是v-for下的直接子节点
    Object.keys(node).every(isStaticKey)
  ))
}

function isDirectChildOfTemplateFor(node: ASTElement): boolean {
  while (node.parent) {
    node = node.parent
    if (node.tag !== 'template') {
      return false
    }
    if (node.for) {
      return true
    }
  }
  return false
}
