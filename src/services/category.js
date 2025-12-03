import api from "./api";
export const getCategories = async () => {
  const { data } = await api.get("/categories/getCategories");
  return Array.isArray(data) ? data : data.items ?? [];
};
