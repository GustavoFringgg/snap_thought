<template>
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-logo">Snop<strong>Thought</strong></div>
      <p class="login-sub">輸入密碼以繼續</p>

      <form class="login-form" @submit.prevent="handleSubmit">
        <input
          v-model="password"
          type="password"
          class="login-input"
          placeholder="密碼"
          autocomplete="current-password"
          autofocus
        />
        <p v-if="error" class="login-error">{{ error }}</p>
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? "驗證中…" : "登入" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { setToken } from "../utils/api";

const emit = defineEmits<{ success: [] }>();

const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleSubmit() {
  if (!password.value) return;
  loading.value = true;
  error.value = "";
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE ?? ""}/api/v1/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.value }),
      }
    );
    if (!res.ok) {
      error.value = "密碼錯誤";
      return;
    }
    const data = await res.json();
    setToken(data.token);
    emit("success");
  } catch {
    error.value = "連線失敗，請稍後再試";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-wrap {
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
}

.login-card {
  width: 100%;
  max-width: 360px;
  padding: 40px 32px;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.login-logo {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.4px;
  margin-bottom: 4px;
}

.login-logo strong {
  color: var(--color-primary);
}

.login-sub {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.login-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--color-text);
  transition: border-color var(--transition), box-shadow var(--transition);
  box-sizing: border-box;
}

.login-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.login-error {
  font-size: 12px;
  color: #dc2626;
  font-weight: 500;
}

.login-btn {
  padding: 10px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transition);
}

.login-btn:hover:not(:disabled) {
  opacity: 0.88;
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
