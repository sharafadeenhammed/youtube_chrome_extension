export async function getCurrentActiveTab() {
  const queryOptions = {
    active: true,
    currentWindow: true,
  };
  const tab = await chrome.tabs.query(queryOptions);
  return tab[0];
}
