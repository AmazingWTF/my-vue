import { parse } from './parser/index'

export function compile (template, options) {
  const ast = parse(template.trim(), options)
}