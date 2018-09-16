import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Menu } from 'semantic-ui-react';

const MenuComponent = () => (
  <Menu inverted>
    <Container>
      <Menu.Item as="a" header>
        Volution
      </Menu.Item>
      {/* <Menu.Item>
        <Link to="/">Home</Link>
      </Menu.Item>
      <Menu.Item>
        <Link to="/query">Query Demo</Link>
      </Menu.Item>
      <Menu.Item>
        <Link to="/subscription">Subscription Demo</Link>
      </Menu.Item> */}
      <Menu.Item>
        <Link to="/Volution">Home</Link>
      </Menu.Item>
    </Container>
  </Menu>
);

export default MenuComponent;
