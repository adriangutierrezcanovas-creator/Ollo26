const PROFILE_KEY = "viaje_profile";

const PROFILES = [
  { id: "adri", label: "Adri", isAdmin: true },
  { id: "katri", label: "Katri", isAdmin: false },
  { id: "nadia", label: "Nadia", isAdmin: false },
  { id: "gon", label: "Gon", isAdmin: false },
];

const Profile = {
  get() {
    const id = localStorage.getItem(PROFILE_KEY);
    return PROFILES.find((p) => p.id === id) || null;
  },
  set(id) {
    localStorage.setItem(PROFILE_KEY, id);
  },
  clear() {
    localStorage.removeItem(PROFILE_KEY);
  },
  isAdmin() {
    const p = Profile.get();
    return !!p && p.isAdmin;
  },
};
