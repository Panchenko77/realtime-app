import type {
  attrs,
  Raw,
  selector,
  VElement,
  VFragment,
  VNode,
  VNodeList,
} from '../client/dom'
import { tagNameRegex } from '../client/dom.js'
import escapeHTML from 'escape-html'

export type Component<T extends object> = (
  props?: T,
  children?: VNodeList,
) => VNode
export type ComponentInvoke = [Component<any>, attrs?, VNodeList?]

export function Raw(props: { html: string }): JSX.Element {
  return ['raw', props.html] as any
}

export function Fragment(
  props?: { list?: VNodeList },
  children?: VNodeList,
): JSX.Element {
  let nodes: VNodeList = props?.list || children || []
  return [nodes] as any
}

export function VElementToString([selector, attrs, children]:
  | VElement
  | ComponentInvoke): string {
  // component function
  if (typeof selector === 'function') {
    let component = selector as Component<any>
    return VNodeToString(
      component(attrs ? Object.fromEntries(attrs) : attrs, children),
    )
  }
  let tagName = selector.match(tagNameRegex)![1]
  let html = `<${tagName}`
  attrs?.forEach(([key, value]) => {
    switch (key) {
      case 'class':
      case 'style':
        if (!value) {
          return
        }
    }
    value = JSON.stringify(value)
    html += ` ${key}=${value}`
  })
  html += `>`
  switch (tagName) {
    case 'img':
    case 'input':
    case 'br':
    case 'hr':
    case 'meta':
      return html
  }
  if (children) {
    children.forEach(child => (html += VNodeToString(child)))
  }
  html += `</${tagName}>`
  return html
}

export function VNodeToString(node: VNode): string {
  if (typeof node === 'string') {
    return escapeHTML(node)
  }
  if (node[0] === 'raw') {
    return (node as Raw)[1]
  }
  if (Array.isArray(node[0])) {
    let html = ''
    ;(node as VFragment)[0].forEach(node => (html += VNodeToString(node)))
    return html
  }
  return VElementToString(node as VElement)
}

export function flagsToClassName(flags: Record<string, any>) {
  let classes: string[] = []
  Object.entries(flags).forEach(([key, value]) => {
    if (value) {
      classes.push(key)
    }
  })
  return classes.join(' ')
}
