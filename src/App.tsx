import { Home } from './Home';
import { Profile } from './Profile';
import { BrowserRouter as Router, Link, Route, Switch } from './react-router'
import { User } from './User';

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <div>
            <Link to='/home'>Home</Link>
            <Link to='/user'>user</Link>
            <Link to='/profile'>profile</Link>
          </div>
          <Switch>
            <Route path={'/home/:id'} element={<Home />} />
            <Route path={'/home'} element={<Home />} />
            <Route path={'/user/:userId'} element={<User />} />
            <Route path={'/profile'} element={<Profile />} />
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
