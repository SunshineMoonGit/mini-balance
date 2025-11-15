import { BrowserRouter } from "react-router-dom";

import AppRouter from "./routes/AppRouter";
import { QueryProvider } from "./app/providers/QueryProvider";

const App = () => (
  <QueryProvider>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </QueryProvider>
);

export default App;
