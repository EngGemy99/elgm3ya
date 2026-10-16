import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell.tsx";
import { loadAssociations, saveAssociations } from "./lib/storage.ts";
import { navigate, parseHash, type Route } from "./lib/route.ts";
import { CreatePage } from "./pages/CreatePage.tsx";
import { DetailPage } from "./pages/DetailPage.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { WelcomePage } from "./pages/WelcomePage.tsx";
import type { Association } from "./types.ts";

const WELCOME_KEY = "elgm3ya.welcome.seen";

function App() {
  const [showWelcome, setShowWelcome] = useState(() => sessionStorage.getItem(WELCOME_KEY) !== "1");
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
    route.name === "detail" || route.name === "edit"
      ? associations.find((item) => item.id === route.id)
      : undefined;

  if (showWelcome) {
    return (
      <AppShell>
        <WelcomePage
          onStart={() => {
            sessionStorage.setItem(WELCOME_KEY, "1");
            setShowWelcome(false);
          }}
        />
      </AppShell>
    );
  }

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
          onSave={(association) => {
            updateAssociations([association, ...associations]);
            navigate(`/a/${encodeURIComponent(association.id)}`);
          }}
        />
      ) : null}

      {route.name === "edit" ? (
        current ? (
          <CreatePage
            association={current}
            onBack={() => navigate(`/a/${encodeURIComponent(current.id)}`)}
            onSave={(association) => {
              updateAssociations(
                associations.map((item) => (item.id === association.id ? association : item)),
              );
              navigate(`/a/${encodeURIComponent(association.id)}`);
            }}
          />
        ) : (
          <DetailPage
            association={undefined}
            onBack={() => navigate("/")}
            onChange={() => undefined}
            onDelete={() => undefined}
          />
        )
      ) : null}

      {route.name === "detail" ? (
        <DetailPage
          association={current}
          onBack={() => navigate("/")}
          onEdit={(id) => navigate(`/a/${encodeURIComponent(id)}/edit`)}
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
