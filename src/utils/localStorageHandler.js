function get(key) {
  const data = localStorage.getItem(key);
  if (!data) return undefined;

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error(error);
  }

  return null;
}

function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(error);
    localStorage.setItem(key, null);
  }
}

export default {
  get,
  set,
};
