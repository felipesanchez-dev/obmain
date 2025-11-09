/** */
export const getFormattedDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";
