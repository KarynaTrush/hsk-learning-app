import fs from "fs";

const DIR = "src/i18n/locales";

const patches = {
  ru: {
    resetPw: {
      forgotTitle: "Восстановление пароля",
      forgotText: "Введите почту, которую вы указывали при регистрации. Мы отправим ссылку для создания нового пароля.",
      email: "Электронная почта",
      send: "Отправить ссылку",
      sending: "Отправляем…",
      sent: "Если аккаунт с адресом {{email}} существует, мы отправили на него письмо со ссылкой.",
      sentHint: "Письмо может прийти не сразу. Проверьте папку «Спам». Ссылка действует недолго.",
      back: "Вернуться ко входу",
      newTitle: "Новый пароль",
      newText: "Придумайте новый пароль: не короче 8 символов.",
      password: "Новый пароль",
      confirm: "Повторите пароль",
      save: "Сохранить пароль",
      saving: "Сохраняем…",
      done: "Пароль изменён. Теперь вы можете продолжить обучение.",
      continue: "Продолжить",
      errors: {
        invalid_email: "Введите корректный адрес электронной почты.",
        password_short: "Пароль должен быть не короче 8 символов.",
        password_mismatch: "Пароли не совпадают.",
        password_same: "Новый пароль должен отличаться от старого.",
        rate_limited: "Слишком много попыток. Подождите немного и попробуйте снова.",
        network: "Нет связи с сервером. Проверьте интернет и попробуйте снова.",
        server_error: "Не удалось выполнить действие. Попробуйте позже.",
      },
    },
  },
  pl: {
    resetPw: {
      forgotTitle: "Odzyskiwanie hasła",
      forgotText: "Podaj adres e-mail użyty przy rejestracji. Wyślemy link do utworzenia nowego hasła.",
      email: "Adres e-mail",
      send: "Wyślij link",
      sending: "Wysyłamy…",
      sent: "Jeśli konto z adresem {{email}} istnieje, wysłaliśmy na niego wiadomość z linkiem.",
      sentHint: "Wiadomość może przyjść z opóźnieniem. Sprawdź folder «Spam». Link jest ważny krótko.",
      back: "Wróć do logowania",
      newTitle: "Nowe hasło",
      newText: "Wymyśl nowe hasło: co najmniej 8 znaków.",
      password: "Nowe hasło",
      confirm: "Powtórz hasło",
      save: "Zapisz hasło",
      saving: "Zapisujemy…",
      done: "Hasło zostało zmienione. Możesz kontynuować naukę.",
      continue: "Kontynuuj",
      errors: {
        invalid_email: "Podaj poprawny adres e-mail.",
        password_short: "Hasło musi mieć co najmniej 8 znaków.",
        password_mismatch: "Hasła nie są takie same.",
        password_same: "Nowe hasło musi różnić się od starego.",
        rate_limited: "Zbyt wiele prób. Poczekaj chwilę i spróbuj ponownie.",
        network: "Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.",
        server_error: "Nie udało się wykonać akcji. Spróbuj później.",
      },
    },
  },
  en: {
    resetPw: {
      forgotTitle: "Password recovery",
      forgotText: "Enter the email you used to register. We will send a link to create a new password.",
      email: "Email",
      send: "Send the link",
      sending: "Sending…",
      sent: "If an account with the address {{email}} exists, we have sent it an email with a link.",
      sentHint: "The email may take a while. Check your spam folder. The link is valid for a short time.",
      back: "Back to sign in",
      newTitle: "New password",
      newText: "Choose a new password of at least 8 characters.",
      password: "New password",
      confirm: "Repeat the password",
      save: "Save password",
      saving: "Saving…",
      done: "Your password has been changed. You can now continue learning.",
      continue: "Continue",
      errors: {
        invalid_email: "Enter a valid email address.",
        password_short: "The password must be at least 8 characters long.",
        password_mismatch: "The passwords do not match.",
        password_same: "The new password must be different from the old one.",
        rate_limited: "Too many attempts. Please wait a moment and try again.",
        network: "No connection to the server. Check your internet and try again.",
        server_error: "Could not complete the action. Please try again later.",
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