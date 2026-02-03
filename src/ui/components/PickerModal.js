import { createElement } from "../dom.js";
import { createListView } from "./ListView.js";

// Reusable picker modal with search, archived toggle, and quick-create support.
export const openPickerModal = ({
  app,
  title,
  items,
  getTitle,
  getMeta,
  onPick,
  onQuickCreate,
  allowArchivedToggle = true,
  showArchivedDefault = false,
  searchPlaceholder = "Search",
  emptyMessage = "No matches found.",
}) => {
  const listView = createListView();
  const searchInput = createElement("input", {
    className: "input",
    attrs: { type: "search", placeholder: searchPlaceholder, "aria-label": searchPlaceholder },
  });

  const showArchivedToggle = createElement("input", {
    attrs: { type: "checkbox", "aria-label": "Show archived" },
  });
  showArchivedToggle.checked = Boolean(showArchivedDefault);
  const archivedLabel = createElement("span", { className: "badge", text: "Showing archived: OFF" });

  const updateArchivedLabel = () => {
    const isOn = showArchivedToggle.checked;
    archivedLabel.textContent = `Showing archived: ${isOn ? "ON" : "OFF"}`;
    archivedLabel.className = isOn ? "badge warning" : "badge";
  };

  const updateList = () => {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = (items || []).filter((item) => {
      if (!showArchivedToggle.checked && item.isArchived) {
        return false;
      }
      if (!query) {
        return true;
      }
      const haystack = `${getTitle(item)} ${getMeta(item) || ""}`.toLowerCase();
      return haystack.includes(query);
    });

    if (!filtered.length) {
      listView.setItems([
        {
          title: emptyMessage,
          meta: "",
        },
      ]);
      return;
    }

    listView.setItems(
      filtered.map((item) => ({
        title: getTitle(item),
        meta: getMeta(item),
        isArchived: item.isArchived,
        badges: [
          ...(item.status === "wip" ? [{ text: "WIP", variant: "warning" }] : []),
          ...(item.isArchived ? [{ text: "ARCHIVED", variant: "muted" }] : []),
        ],
        onClick: () => onPick(item),
      }))
    );
  };

  searchInput.addEventListener("input", updateList);
  showArchivedToggle.addEventListener("change", () => {
    updateArchivedLabel();
    updateList();
  });

  const quickCreateButton = onQuickCreate
    ? createElement("button", {
        className: "button secondary",
        text: "Quick create",
        attrs: { type: "button" },
      })
    : null;

  quickCreateButton?.addEventListener("click", () => {
    onQuickCreate?.();
  });

  const content = createElement("div", {
    className: "form-grid",
    children: [
      createElement("div", {
        className: "form-row inline",
        children: [searchInput, ...(quickCreateButton ? [quickCreateButton] : [])],
      }),
      allowArchivedToggle
        ? createElement("div", {
            className: "form-row inline",
            children: [createElement("label", { text: "Show archived", children: [showArchivedToggle] }), archivedLabel],
          })
        : null,
      listView.element,
    ].filter(Boolean),
  });

  updateArchivedLabel();
  updateList();

  app.modal.open({
    title,
    content,
    actions: [{ label: "Close", variant: "secondary", onClick: () => app.modal.close() }],
  });
};
