# ReactRouter

> 起因：面试被问到React-Router，pushState和replaceState会不会触发popstate事件？没答出来。
>
> 过后马上查资料学习。

### 从浏览器的两个API讲起：window.history，window.location

#### [window.history](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/history)

在用户四处浏览网页期间，浏览器维护了一个会话历史堆栈，浏览器前进后退按钮，以及历史记录就是借此实现。window.history对象提供了一些[History API](https://developer.mozilla.org/zh-CN/docs/Web/API/History_API)给开发者使用。其中有我们今天的主角`pushState`和`replaceState`方法。回答面试官问题，调用`pushState`和`replaceState`方法不会触发popstate事件，但是会往会话历史堆栈添加和替换一个条目，`go()`、`back()`、`forward()`这三个才会触发popstate事件。（我将这三个称作Pop方法）

ReactRouter中创建的改良的`history`对象，提供了一个监听URL历史堆栈改变的方法

#### [window.location](https://developer.mozilla.org/zh-CN/docs/Web/API/Location)

浏览器提供的`window.location`对象，保存了URL有关的信息

ReactRouter内部维护了一个`location`对象，保留原location对象部分属性。

### ReactRouter内的history，location对象

> 我将实现一个简易版ReactRouter，仅用于原理剖析，具体实现得去看React-Router源码。所以接下来属性方法定义类型不会完全同源码一致。

类型定义如下：

```typescript
type BrowserHistory = {
    length: number;
    action: Action;
    location: {
        pathname: string;
        state: any;
        search: string;
        hash: string;
        key: string;
    };
    createHref: (location: Location) => string;
    listen: (listener: Listener) => () => void;
    push: (to: string, state?: any) => void;
    replace: (to: string, state?: any) => void;
    go: (n: number) => void;
    back: () => void;
    forward: () => void;
}

type location = {
    pathname: string,
    search: string,
    hash: string,
    state: any
    key: string
}
```



## 原理总览

>  本文只以`history`模式为例剖析原理，hash模式同理。

调用`createBrowserHistory`生成history对象，在history中实现会话之间管理历史堆栈、导航和保持状态；在`BrowserRouter`组件中监听URL，实现对`history`，`location`对象的状态维护；在`Router`组件，将两个对象通过`context`共享到全局，提供给各个组件消费。在`pathMatch`中，实现URL跟路由的匹配；在其余路由组件中都可以实现路由匹配组件，控制组件渲染。

**模块与库的所属关系：**

`history`：`createBrowserHistory`

`react-router`：`Router`，`RouterContext`，`Route`，`pathMatch`

`react-router-dom`：`BrowerRouter`，`Link`，`Navigate`，`Switch`

## 具体实现

### createBrowserHistory

![image-20230220203207134.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e2369ac97b1e4502887963116e5ba6c9~tplv-k3u1fbpfcp-watermark.image?)

#### 实现原理

history中维护一个history对象，通过setState方法对状态更新。更新浏览器维护的历史堆栈的同时也要更新自己维护的location对象，并且通知到BrowerRouter组件。go，goback，goForward三个方法直接调用浏览器API，在监听popstate的回调中更新自己的location对象，此处监听还有一个作用是当用户点击前进后退按钮时，也要更新自己的location对象。push和replace在调用浏览器API后，需要主动调用setstate更新自己的locaiton对象，因为不会触发popstate。

> push和replace触发之后浏览器没有刷新页面，这就做到更改URL而不刷新页面；hash模式下改变URL的hash值也是不会刷新页面。

```typescript
// 更新history对象里的action，location，length，并触发发布
  function setState({ location, action }: State) {
    Object.assign(history, { location, action });
    history.length = globalHistory.length;
    listeners.forEach(listener => listener({ location, action }));
  }

  function listen(listener: Listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(item => {
        return item !== listener
      })
    }
  }

  window.addEventListener('popstate', () => {
    let windowLocation = window.location
    setState({
      action: Action.Pop,
      location: {
        pathname: windowLocation.pathname,
        hash: windowLocation.hash,
        search: windowLocation.search,
        state: window.history.state,
        key: createKey()
      }
    })
  })

  function push(to: string, state?: any) {
    const action = Action.Push;
    const location = Object.assign(parsePath(to), { state, key: createKey() });
    globalHistory.pushState(state, '', to);
    setState({ action, location });
  }

  function replace(to: string, state?: any) {
    const action = Action.Replace;
    const location = Object.assign(parsePath(to), { state, key: createKey() });
    globalHistory.replaceState(state, '', to);
    setState({ action, location });
  }

  function go(n: number) {
    globalHistory.go(n)
  }

  function goBack() {
    globalHistory.go(-1)
  }

  function goForward() {
    globalHistory.go(1)
  }
```

工具方法

```typescript
  // 从path获取hash pathname search
   function parsePath(path: string) {
    let parsedPath: {
      hash: string,
      pathname: string,
      search: string,
    } = {
      hash: '',
      pathname: '',
      search: '',
    }

    if (path) {
      let hashIndex = path.indexOf('#');
      if (hashIndex >= 0) {
        parsedPath.hash = path.substring(hashIndex);
        path = path.substring(0, hashIndex);
      }

      let searchIndex = path.indexOf('?');
      if (searchIndex >= 0) {
        parsedPath.search = path.substring(searchIndex);
        path = path.substring(0, searchIndex);
      }

      parsedPath.pathname = path;
    }
    return parsedPath
  }
  // 获取随机key
  function createKey() {
    return Math.random().toString(36).substring(2, 8);
  }
```

### Router

将location数据共享到全局

```jsx
// Router.tsx
export const Router = ({ location, history, children }: RouterProps) => {
  const match = pathMatch("/", history.location.pathname)

  return (
    <RouterContext.Provider
      value={{
        match,
        location: location,
        history: history,
      }}>
      {children}
    </RouterContext.Provider>
  )
}
```

### BrowserRouter

在`BrowserRouter`组件中调用history.listen，实现对`history`，`location`对象状态的维护与更新

```tsx
// BrowserRouter.tsx
export default function BrowserRouter(props: BrowserRouterProps) {

  const historyRef = useRef<BrowserHistory>(null!)

  if (!historyRef.current) {
    historyRef.current = createBrowserHistory()
  }

  const history = historyRef.current

  const [locationState, setLocationState] = useState(history.location)
  const [action, setAction] = useState(history.action)

  useLayoutEffect(() => {
    history.listen(({ location, action }) => {
      setLocationState(location)
      setAction(action)
    })
  }, [history])

  return <Router
    history={{
      ...history,
      action,
    }}
    location={locationState}
  >
    {props.children}
  </Router>
}
```

### Route

根据location中的URL信息，匹配组件，控制渲染

```jsx
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
```

### Switch

实现选择最佳组件渲染

```jsx
export default function Switch({ children }: SwitchProps) {
  return (
    <RouterContext.Consumer>
      {({ location }) => {
        let resultChildren = [];
        // 如果子组件只有一个,就将其放进数组里面
        if (children instanceof Array) resultChildren = children;
        else if (children instanceof Object) resultChildren = [children];
        // 遍历子组件数组,匹配到即返回
        for (const item of resultChildren) {
          const { path = "", exact = false, sensitive = false, strict = false, element } = item.props;
          // 我们知道location.pathname是正儿八经的浏览器地址, 而我们书写在Route组件上的是path规则
          // 所以我们要匹配只能使用我们之前封装好的pathMatch函数
          const match = pathMatch(path, location.pathname, { exact, sensitive, strict })

          // 只要不等于null就是匹配到了
          if (match != null) {
            return React.cloneElement(element, { location, computedMatch: match })
          }
        }
        // 如果循环了一轮都没有匹配到
        return null;
      }}
    </RouterContext.Consumer>
  )
}
```