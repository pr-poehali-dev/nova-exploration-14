
CREATE TABLE vacancies (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'Удалённо',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  position TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'Удалённо',
  status TEXT NOT NULL DEFAULT 'active',
  hired_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO vacancies (title, category, format) VALUES
  ('Аналитик данных', 'Информационная безопасность', 'Удалённо'),
  ('Системный администратор', 'Техническое обеспечение', 'Гибрид'),
  ('Специалист по документообороту', 'Административный отдел', 'Удалённо');

INSERT INTO applications (name, email, position, message, status) VALUES
  ('Петров Алексей Иванович', 'petrov@mail.ru', 'Аналитик данных', 'Опыт работы 5 лет в сфере ИБ', 'new'),
  ('Смирнова Елена Сергеевна', 'smirnova@yandex.ru', 'Системный администратор', 'Готова к удалённой работе', 'review'),
  ('Козлов Дмитрий Николаевич', 'kozlov@gmail.com', 'Специалист по документообороту', 'Опыт в госструктурах 3 года', 'approved');

INSERT INTO employees (name, email, position, department, format, status) VALUES
  ('Иванова Марина Олеговна', 'ivanova@fsb.ru', 'Старший аналитик', 'Информационная безопасность', 'Удалённо', 'active'),
  ('Соколов Виктор Андреевич', 'sokolov@fsb.ru', 'Ведущий инженер', 'Техническое обеспечение', 'Гибрид', 'active');
