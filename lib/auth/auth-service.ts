// lib/auth/auth-service.ts

// Registro do usuário
export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erro ao registrar");
  }

  return data;
}

export async function loginUser(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erro ao fazer login");
  }

  return data;
}

// Logout do usuário (chama rota API que limpa o cookie)
export async function logoutUser() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Erro ao fazer logout");
  }

  return true;
}

// Verifica autenticação via chamada para rota protegida
export async function isAuthenticated() {
  const res = await fetch("/api/auth/session");
  const data = await res.json();

  return data.authenticated;
}
