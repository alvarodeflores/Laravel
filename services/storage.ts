export const setTreeDataToStore = (data: any) => {
  const exists = getTreeDataFromStore();

  localStorage.setItem("kk_tree_data", JSON.stringify([...exists, data]));
};

export const getTreeDataFromStore = () => {
  const data = localStorage.getItem("kk_tree_data");
  try {
    return JSON.parse(data || "");
  } catch (err) {
    console.log(err);
  }

  return [];
};
