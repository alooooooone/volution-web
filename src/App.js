import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Volution from './pages/Volution';

const App = () => (
  <Router>
    <div>
      <Route exact path="/" component={Volution} />
    </div>
  </Router>
);
export default App;
