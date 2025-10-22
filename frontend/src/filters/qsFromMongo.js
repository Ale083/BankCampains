export function mongoFilterToQuery(filter) {
  if (!filter || typeof filter !== "object") return "";
  const params = new URLSearchParams();

  for (const [field, cond] of Object.entries(filter)) {
    if (cond && typeof cond === "object") {
      if (Array.isArray(cond.$in) && cond.$in.length) {
        params.set(field, cond.$in.join(","));
      }
      if (cond.$gte !== undefined && cond.$gte !== null && cond.$gte !== "") {
        params.set(`${field}Min`, String(cond.$gte));
      }
      if (cond.$lte !== undefined && cond.$lte !== null && cond.$lte !== "") {
        params.set(`${field}Max`, String(cond.$lte));
      }
    } else if (cond !== undefined && cond !== null && cond !== "") {
      params.set(field, String(cond));
    }
  }
  return params.toString();
}
