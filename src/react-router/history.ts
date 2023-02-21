export enum Action {
  Replace = "REPLACE",
  Pop = "POP",
  Push = "PUSH"
}
interface State {
  location: {
    pathname: string,
    search: string,
    hash: string,
    state: any
    key: string
  },
  action: Action
}
type Listener = ({ location, action }: State) => void

// ReturnType 获取函数的返回值类型
export type BrowserHistory = ReturnType<typeof createBrowserHistory>

export default function createBrowserHistory() {
  const globalHistory = window.history;
  let listeners: Listener[] = []
  let initLocation = {
    pathname: window.location.pathname,
    // 用来保存对象上的状态这就是为什么浏览器刷新之后还是会看到当前页面的状态。
    state: globalHistory.state,
    search: '',
    hash: '',
    key: createKey()
  };

  function createHref(location: Location) {
    return `${location.protocol}${location.host}${location.pathname}${location.search}${location.hash}`
  }

  // 更新history对象里的action，location，length，并触发发布
  function setState({ location, action }: State) {
    Object.assign(history, { location, action });
    history.length = globalHistory.length;
    listeners.forEach(listener => listener({ location, action }));
  }

  // 暴露出listen函数,给组件监听URL变化的接口
  function listen(listener: Listener) {
    listeners.push(listener);
    // 返回一个移除监听的函数
    return () => {
      listeners = listeners.filter(item => {
        return item !== listener
      })
    }
  }

  // 监听pop方法,和用户前进后退,改变location的状态
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

  function createKey() {
    return Math.random().toString(36).substring(2, 8);
  }

  let history = {
    length: globalHistory.length,
    action: Action.Pop,
    location: initLocation,
    createHref,
    listen,
    push,
    replace,
    go,
    back: goBack,
    forward: goForward
  }
  return history;
}