import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell.tsx";
import { loadAssociations, saveAssociations } from "./lib/storage.ts";
import { navigate, parseHash, type Route } from "./lib/route.ts";
import { CreatePage } from "./pages/CreatePage.tsx";
import { DetailPage } from "./pages/DetailPage.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import type { Association } from "./types.ts";

function App() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  const [associations, setAssociations] = useState<Association[]>(() => loadAssociations());

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function updateAssociations(next: Association[]) {
    setAssociations(next);
    saveAssociations(next);
  }

  const current =
    route.name === "detail" ? associations.find((item) => item.id === route.id) : undefined;

  return (
    <AppShell>
      {route.name === "home" ? (
        <HomePage
          associations={associations}
          onCreate={() => navigate("/new")}
          onOpen={(id) => navigate(`/a/${encodeURIComponent(id)}`)}
        />
      ) : null}

      {route.name === "new" ? (
        <CreatePage
          onBack={() => navigate("/")}
          onCreate={(association) => {
            updateAssociations([association, ...associations]);
            navigate(`/a/${encodeURIComponent(association.id)}`);
          }}
        />
      ) : null}

      {route.name === "detail" ? (
        <DetailPage
          association={current}
          onBack={() => navigate("/")}
          onChange={(association) => {
            updateAssociations(
              associations.map((item) => (item.id === association.id ? association : item)),
            );
          }}
          onDelete={(id) => {
            updateAssociations(associations.filter((item) => item.id !== id));
            navigate("/");
          }}
        />
      ) : null}
    </AppShell>
  );
}

export default App;
