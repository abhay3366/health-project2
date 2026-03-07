const BASE = "http://localhost:3001";

export const api = {
  getAllUsers: () => fetch(`${BASE}/users`).then((r) => r.json()),

  getUsersByRole: (role) =>
    fetch(`${BASE}/users?role=${role}`).then((r) => r.json()),


  getUsersByCoach: async (coachId) => {
    const all = await fetch(`${BASE}/users`).then((r) => r.json());
    return all.filter((u) => String(u.coach_id) === String(coachId));
  },

  getUserById: (id) =>
    fetch(`${BASE}/users/${id}`).then((r) => r.json()),

  createUser: (data) =>
    fetch(`${BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        isActive: true,
        avatar: data.name.slice(0, 2).toUpperCase(),
      }),
    }).then((r) => r.json()),

  updateUser: (id, data) =>
    fetch(`${BASE}/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  deleteUser: (id) =>
    fetch(`${BASE}/users/${id}`, { method: "DELETE" }),

  promoteToCoach: (id) =>
    fetch(`${BASE}/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "coach", coach_id: null }),
    }).then((r) => r.json()),

  demoteToUser: (id) =>
    fetch(`${BASE}/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "user", coach_id: null }),
    }).then((r) => r.json()),
};
