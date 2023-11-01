import { BrowserRouter, Link } from 'react-router-dom';
import { routes } from '../routes';

export const Nav = () => {
  return (
    <BrowserRouter>
      <div style={{display: "flex", gap: "1rem", marginBottom: "1rem"}}>
        {routes.map((route) => (
          <Link key={route.name} to={route.href}>
            {route.name}
          </Link>
        ))}
      </div>
    </BrowserRouter>
  );
};
