import React, { ReactElement } from "react";
import pathMatch from "./pathMatch";
import { ContextProps } from "./RouterContext";
import { RouterContext } from "./RouterContext";

interface RouteProps {
  children?: React.ReactNode | ((ctxValue: ContextProps) => ReactElement),
  sensitive?: boolean,
  exact?: boolean,
  strict?: boolean,
  element: ReactElement
  path: string
}

export default function Route({
  sensitive = false,
  exact = false,
  strict = false,
  path,
  children,
  element
}: RouteProps) {
  return <RouterContext.Consumer>
    {
      ({ location, history }) => {
        const match = pathMatch(path, location.pathname, { sensitive, exact, strict })
        const ctxValue = { location, history, match }
        return getRenderChildren(children, element, ctxValue)
      }
    }
  </RouterContext.Consumer>
}

/**
 * 有子组件先渲染子组件,没有再匹配路由,渲染对应组件
 * @param children
 * @param element
 * @param ctxValue
 * @returns
 */
const getRenderChildren = (
  children: React.ReactNode | ((ctxValue: ContextProps) => ReactElement),
  element: ReactElement,
  ctxValue: ContextProps
) => {
  if (children != null) {
    return typeof children === 'function' ? children(ctxValue) : children
  }

  if (ctxValue.match == null) return null
  if (element) return React.cloneElement(element, { ...ctxValue })

  return null
}