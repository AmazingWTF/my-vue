import { no } from '../../shared/util'
import { pluckModuleFunction } from '../helper'
import { parseHTML } from './html-parser'

// configurable state
let platformGetTagNamespace
let platformMustUseProp
let platformIsPreTag
let preTransforms
let transforms
let postTransforms
let delimiters

/**
 * Convert HTML string to AST.
 */
export function parse (template, options) {
  platformGetTagNamespace = options.platformGetTagNamespace || no
  platformMustUseProp = options.platformMustUseProp || no
  platformIsPreTag = options.platformIsPreTag || no
  preTransforms = pluckModuleFunction(options.modules, 'preTransformNode')
  transforms = pluckModuleFunction(options.modules, 'transformNode')
  postTransforms = pluckModuleFunction(options.modules, 'postTransformNode')
  delimiters = options.delimiters
  const stack = []
  const preserveWhitespace = options.preserveWhitespace !== false
  let root
  let currentParent
  let inVPre = false
  let inPre = false
  parseHTML(template, {

  })
}

