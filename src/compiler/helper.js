// 找出匹配的module
export function pluckModuleFunction (modules, key) {
  return modules ? modules.map(m => m[key]).filter(_ => _) : []
}

