import { pathToRegexp, Key } from "path-to-regexp";

export type PathMatch = ReturnType<typeof pathMatch>

export default function pathMatch(path = '', url = '', options = {}) {
  const matchOptions = getOptions(options)

  // 存放匹配到的动态路由的key值 /home/:homeId
  const matchKeys: Key[] = []
  // 调库生成一个匹配path的正则,path就是组件对应的路由,url就是地址栏的路由
  const pathRegexp = pathToRegexp(path, matchKeys, matchOptions)
  const matchResult = pathRegexp.exec(url)

  // 当没有成功匹配的url时,返回空
  if (!matchResult) return null

  const paramsObj = paramsCreator(matchResult, matchKeys)
  return {
    params: paramsObj,
    path,
    url: matchResult[0], // matchResult作为类数组的第0项就是匹配路径规则的部分
    isExact: matchResult[0] === url
  }
}

/**
 * 将用户传递的配置对象，转换成path-to-regex需要的配置对象
 * @param param0
 */
function getOptions({ sensitive = false, strict = false, exact = false }) {
  const defaultOptions = {
    sensitive: false,
    strict: false,
    exact: false
  }
  return {
    ...defaultOptions,
    sensitive,
    strict,
    end: exact
  }
}

/**
 * 返回动态路由参数键值对
 */
function paramsCreator(matchResult: RegExpExecArray, matchKeys: Key[]) {
  const matchVals = [].slice.call(matchResult, 1);
  const paramsObj: { [key: string | number]: any } = {};
  matchKeys.forEach((k, i) => {
    paramsObj[k.name] = matchVals[i]
  })
  return paramsObj
}