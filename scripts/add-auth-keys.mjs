// node scripts/add-auth-keys.mjs
import fs from "fs";

const DIR = "src/i18n/locales";

const patches = {
  ru: {
    auth: {
      loading: "Подождите…",
      errors: {
        invalid_email: "Введите корректный email",
        password_short: "Пароль должен содержать минимум 8 символов",
        name_required: "Введите имя",
        invalid_credentials: "Неверный email или пароль",
        email_taken: "Этот email уже зарегистрирован",
        confirm_email: "Проверьте почту: мы отправили ссылку для подтверждения",
        rate_limited: "Слишком много попыток. Подождите немного",
        network: "Нет связи с сервером. Проверьте интернет",
        not_configured: "Не настроено подключение к Supabase (файл .env.local)",
        wrong_password: "Текущий пароль указан неверно",
        server_error: "Что-то пошло не так. Попробуйте ещё раз",
      },
    },
  },
  pl: {
    auth: {
      loading: "Chwileczkę…",
      errors: {
        invalid_email: "Wpisz poprawny adres e-mail",
        password_short: "Hasło musi mieć co najmniej 8 znaków",
        name_required: "Wpisz imię",
        invalid_credentials: "Nieprawidłowy e-mail lub hasło",
        email_taken: "Ten adres e-mail jest już zarejestrowany",
        confirm_email: "Sprawdź skrzynkę: wysłaliśmy link potwierdzający",
        rate_limited: "Zbyt wiele prób. Odczekaj chwilę",
        network: "Brak połączenia z serwerem. Sprawdź internet",
        not_configured: "Nie skonfigurowano połączenia z Supabase (plik .env.local)",
        wrong_password: "Aktualne hasło jest nieprawidłowe",
        server_error: "Coś poszło nie tak. Spróbuj ponownie",
      },
    },
  },
  en: {
    auth: {
      loading: "Please wait…",
      errors: {
        invalid_email: "Enter a valid email",
        password_short: "Password must be at least 8 characters",
        name_required: "Enter your name",
        invalid_credentials: "Incorrect email or password",
        email_taken: "This email is already registered",
        confirm_email: "Check your inbox: we sent a confirmation link",
        rate_limited: "Too many attempts. Please wait a moment",
        network: "No connection to the server. Check your internet",
        not_configured: "Supabase connection is not configured (.env.local)",
        wrong_password: "The current password is incorrect",
        server_error: "Something went wrong. Please try again",
      },
    },
  },
};

function merge(target, patch, path = "", added = []) {
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === "object") {
      if (!target[k] || typeof target[k] !== "object") target[k] = {};
      merge(target[k], v, path + k + ".", added);
    } else if (!(k in target)) {
      target[k] = v;
      added.push(path + k);
    }
  }
  return added;
}

for (const [lang, patch] of Object.entries(patches)) {
  const file = `${DIR}/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const added = merge(data, patch);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  console.log(`[${lang}] добавлено ключей: ${added.length}`);
}