import { useState } from "react"
import Icon from "@/components/ui/icon"

const ADMIN_PASSWORD = "fsb2025"

const initialVacancies = [
  { id: 1, title: "Аналитик данных", category: "Информационная безопасность", format: "Удалённо", status: "active" },
  { id: 2, title: "Системный администратор", category: "Техническое обеспечение", format: "Гибрид", status: "active" },
  { id: 3, title: "Специалист по документообороту", category: "Административный отдел", format: "Удалённо", status: "active" },
]

const initialApplications = [
  { id: 1, name: "Петров Алексей Иванович", email: "petrov@mail.ru", position: "Аналитик данных", date: "28.03.2025", status: "new" },
  { id: 2, name: "Смирнова Елена Сергеевна", email: "smirnova@yandex.ru", position: "Системный администратор", date: "27.03.2025", status: "review" },
  { id: 3, name: "Козлов Дмитрий Николаевич", email: "kozlov@gmail.com", position: "Специалист по документообороту", date: "26.03.2025", status: "approved" },
]

type Tab = "dashboard" | "vacancies" | "applications" | "settings"

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")
  const [vacancies, setVacancies] = useState(initialVacancies)
  const [applications, setApplications] = useState(initialApplications)
  const [showAddVacancy, setShowAddVacancy] = useState(false)
  const [newVacancy, setNewVacancy] = useState({ title: "", category: "", format: "Удалённо" })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true)
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  const handleAddVacancy = () => {
    if (!newVacancy.title || !newVacancy.category) return
    setVacancies([...vacancies, { id: Date.now(), ...newVacancy, status: "active" }])
    setNewVacancy({ title: "", category: "", format: "Удалённо" })
    setShowAddVacancy(false)
  }

  const handleDeleteVacancy = (id: number) => {
    setVacancies(vacancies.filter(v => v.id !== id))
  }

  const handleApplicationStatus = (id: number, status: string) => {
    setApplications(applications.map(a => a.id === id ? { ...a, status } : a))
  }

  const stats = [
    { label: "Активных вакансий", value: vacancies.filter(v => v.status === "active").length, icon: "Briefcase" },
    { label: "Новых заявок", value: applications.filter(a => a.status === "new").length, icon: "FileText" },
    { label: "На рассмотрении", value: applications.filter(a => a.status === "review").length, icon: "Clock" },
    { label: "Одобрено", value: applications.filter(a => a.status === "approved").length, icon: "CheckCircle" },
  ]

  const statusLabels: Record<string, string> = {
    new: "Новая",
    review: "На рассмотрении",
    approved: "Одобрено",
    rejected: "Отклонено",
  }

  const statusColors: Record<string, string> = {
    new: "text-yellow-400 bg-yellow-400/10",
    review: "text-blue-400 bg-blue-400/10",
    approved: "text-green-400 bg-green-400/10",
    rejected: "text-red-400 bg-red-400/10",
  }

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(220,40%,6%)]">
        <div className="w-full max-w-sm px-4">
          <div className="mb-8 text-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/e/e6/Emblem_of_Federal_security_service.svg"
              alt="Герб ФСБ"
              className="mx-auto mb-4 h-20 w-auto opacity-90"
            />
            <h1 className="font-serif text-2xl font-normal text-[hsl(45,20%,94%)]">Панель управления</h1>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-[hsl(45,20%,94%)]/50">
              ФСБ Remote · Служебный доступ
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-[hsl(45,20%,94%)]/60">
                Пароль доступа
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(false) }}
                className="w-full border border-[hsl(220,30%,16%)] bg-[hsl(220,38%,9%)] px-4 py-3 font-mono text-sm text-[hsl(45,20%,94%)] placeholder:text-[hsl(45,20%,94%)]/30 focus:border-[hsl(43,74%,52%)] focus:outline-none"
                placeholder="Введите пароль"
                autoFocus
              />
              {passwordError && (
                <p className="mt-2 font-mono text-xs text-red-400">Неверный пароль. Доступ запрещён.</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-[hsl(43,74%,52%)] px-4 py-3 font-sans text-sm font-bold uppercase tracking-widest text-[hsl(220,40%,6%)] transition-opacity hover:opacity-90"
            >
              Войти
            </button>
          </form>

          <p className="mt-6 text-center font-mono text-xs text-[hsl(45,20%,94%)]/30">
            Подсказка: fsb2025
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[hsl(220,40%,6%)] text-[hsl(45,20%,94%)]">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-[hsl(220,30%,16%)] bg-[hsl(220,38%,9%)]">
        <div className="flex items-center gap-3 border-b border-[hsl(220,30%,16%)] px-5 py-5">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/e/e6/Emblem_of_Federal_security_service.svg"
            alt="Герб ФСБ"
            className="h-10 w-auto opacity-90"
          />
          <div>
            <div className="font-serif text-base font-normal">ФСБ Remote</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[hsl(45,20%,94%)]/50">Администратор</div>
          </div>
        </div>

        <nav className="flex-1 p-3">
          {([
            { id: "dashboard", label: "Сводка", icon: "LayoutDashboard" },
            { id: "vacancies", label: "Вакансии", icon: "Briefcase" },
            { id: "applications", label: "Заявки", icon: "FileText" },
            { id: "settings", label: "Настройки", icon: "Settings" },
          ] as { id: Tab; label: string; icon: string }[]).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`mb-1 flex w-full items-center gap-3 px-3 py-2.5 text-left font-sans text-sm transition-colors ${
                activeTab === item.id
                  ? "bg-[hsl(43,74%,52%)]/15 text-[hsl(43,74%,52%)]"
                  : "text-[hsl(45,20%,94%)]/70 hover:bg-[hsl(220,30%,16%)] hover:text-[hsl(45,20%,94%)]"
              }`}
            >
              <Icon name={item.icon} fallback="Circle" size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-[hsl(220,30%,16%)] p-3">
          <button
            onClick={() => setIsLoggedIn(false)}
            className="flex w-full items-center gap-3 px-3 py-2.5 font-sans text-sm text-[hsl(45,20%,94%)]/50 transition-colors hover:text-red-400"
          >
            <Icon name="LogOut" size={16} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b border-[hsl(220,30%,16%)] px-8 py-5">
          <h1 className="font-serif text-2xl font-normal">
            {activeTab === "dashboard" && "Сводка"}
            {activeTab === "vacancies" && "Управление вакансиями"}
            {activeTab === "applications" && "Входящие заявки"}
            {activeTab === "settings" && "Настройки сайта"}
          </h1>
          <p className="font-mono text-xs text-[hsl(45,20%,94%)]/50">
            {new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="p-8">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="border border-[hsl(220,30%,16%)] bg-[hsl(220,38%,9%)] p-5">
                    <div className="mb-3 flex items-center gap-2 text-[hsl(45,20%,94%)]/50">
                      <Icon name={stat.icon} fallback="Circle" size={14} />
                      <span className="font-mono text-xs uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <div className="font-serif text-4xl font-normal text-[hsl(43,74%,52%)]">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="border border-[hsl(220,30%,16%)] bg-[hsl(220,38%,9%)] p-6">
                <h2 className="mb-4 font-serif text-lg">Последние заявки</h2>
                <div className="space-y-3">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center justify-between border-b border-[hsl(220,30%,16%)] pb-3">
                      <div>
                        <div className="font-sans text-sm">{app.name}</div>
                        <div className="font-mono text-xs text-[hsl(45,20%,94%)]/50">{app.position} · {app.date}</div>
                      </div>
                      <span className={`rounded px-2 py-0.5 font-mono text-xs ${statusColors[app.status]}`}>
                        {statusLabels[app.status]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Vacancies */}
          {activeTab === "vacancies" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddVacancy(true)}
                  className="flex items-center gap-2 bg-[hsl(43,74%,52%)] px-4 py-2 font-sans text-sm font-bold text-[hsl(220,40%,6%)] transition-opacity hover:opacity-90"
                >
                  <Icon name="Plus" size={14} />
                  Добавить вакансию
                </button>
              </div>

              {showAddVacancy && (
                <div className="border border-[hsl(43,74%,52%)]/30 bg-[hsl(220,38%,9%)] p-5">
                  <h3 className="mb-4 font-serif text-base">Новая вакансия</h3>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block font-mono text-xs text-[hsl(45,20%,94%)]/60">Должность</label>
                      <input
                        type="text"
                        value={newVacancy.title}
                        onChange={(e) => setNewVacancy({ ...newVacancy, title: e.target.value })}
                        className="w-full border border-[hsl(220,30%,16%)] bg-[hsl(220,40%,6%)] px-3 py-2 font-sans text-sm text-[hsl(45,20%,94%)] focus:border-[hsl(43,74%,52%)] focus:outline-none"
                        placeholder="Название должности"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-mono text-xs text-[hsl(45,20%,94%)]/60">Направление</label>
                      <input
                        type="text"
                        value={newVacancy.category}
                        onChange={(e) => setNewVacancy({ ...newVacancy, category: e.target.value })}
                        className="w-full border border-[hsl(220,30%,16%)] bg-[hsl(220,40%,6%)] px-3 py-2 font-sans text-sm text-[hsl(45,20%,94%)] focus:border-[hsl(43,74%,52%)] focus:outline-none"
                        placeholder="Отдел / направление"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-mono text-xs text-[hsl(45,20%,94%)]/60">Формат</label>
                      <select
                        value={newVacancy.format}
                        onChange={(e) => setNewVacancy({ ...newVacancy, format: e.target.value })}
                        className="w-full border border-[hsl(220,30%,16%)] bg-[hsl(220,40%,6%)] px-3 py-2 font-sans text-sm text-[hsl(45,20%,94%)] focus:border-[hsl(43,74%,52%)] focus:outline-none"
                      >
                        <option>Удалённо</option>
                        <option>Гибрид</option>
                        <option>В офисе</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={handleAddVacancy} className="bg-[hsl(43,74%,52%)] px-4 py-2 font-sans text-sm font-bold text-[hsl(220,40%,6%)] hover:opacity-90">
                      Сохранить
                    </button>
                    <button onClick={() => setShowAddVacancy(false)} className="border border-[hsl(220,30%,16%)] px-4 py-2 font-sans text-sm text-[hsl(45,20%,94%)]/60 hover:text-[hsl(45,20%,94%)]">
                      Отмена
                    </button>
                  </div>
                </div>
              )}

              <div className="border border-[hsl(220,30%,16%)] bg-[hsl(220,38%,9%)]">
                {vacancies.map((v, i) => (
                  <div key={v.id} className={`flex items-center justify-between px-5 py-4 ${i !== 0 ? "border-t border-[hsl(220,30%,16%)]" : ""}`}>
                    <div>
                      <div className="font-sans text-sm font-medium">{v.title}</div>
                      <div className="font-mono text-xs text-[hsl(45,20%,94%)]/50">{v.category} · {v.format}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteVacancy(v.id)}
                      className="text-[hsl(45,20%,94%)]/30 transition-colors hover:text-red-400"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Applications */}
          {activeTab === "applications" && (
            <div className="border border-[hsl(220,30%,16%)] bg-[hsl(220,38%,9%)]">
              {applications.map((app, i) => (
                <div key={app.id} className={`flex flex-wrap items-center justify-between gap-4 px-5 py-4 ${i !== 0 ? "border-t border-[hsl(220,30%,16%)]" : ""}`}>
                  <div>
                    <div className="font-sans text-sm font-medium">{app.name}</div>
                    <div className="font-mono text-xs text-[hsl(45,20%,94%)]/50">{app.email} · {app.position}</div>
                    <div className="font-mono text-xs text-[hsl(45,20%,94%)]/30">{app.date}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded px-2 py-0.5 font-mono text-xs ${statusColors[app.status]}`}>
                      {statusLabels[app.status]}
                    </span>
                    <select
                      value={app.status}
                      onChange={(e) => handleApplicationStatus(app.id, e.target.value)}
                      className="border border-[hsl(220,30%,16%)] bg-[hsl(220,40%,6%)] px-2 py-1 font-mono text-xs text-[hsl(45,20%,94%)] focus:outline-none"
                    >
                      <option value="new">Новая</option>
                      <option value="review">На рассмотрении</option>
                      <option value="approved">Одобрить</option>
                      <option value="rejected">Отклонить</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="max-w-lg space-y-6">
              <div className="border border-[hsl(220,30%,16%)] bg-[hsl(220,38%,9%)] p-5">
                <h3 className="mb-4 font-serif text-base">Контактные данные</h3>
                <div className="space-y-3">
                  {[
                    { label: "Email для заявок", value: "info@fsb-remote.gov.ru" },
                    { label: "Телефон", value: "+7 (800) 000-00-00" },
                    { label: "Адрес", value: "Россия, все регионы" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="mb-1 block font-mono text-xs text-[hsl(45,20%,94%)]/60">{field.label}</label>
                      <input
                        type="text"
                        defaultValue={field.value}
                        className="w-full border border-[hsl(220,30%,16%)] bg-[hsl(220,40%,6%)] px-3 py-2 font-sans text-sm text-[hsl(45,20%,94%)] focus:border-[hsl(43,74%,52%)] focus:outline-none"
                      />
                    </div>
                  ))}
                  <button className="mt-2 bg-[hsl(43,74%,52%)] px-4 py-2 font-sans text-sm font-bold text-[hsl(220,40%,6%)] hover:opacity-90">
                    Сохранить
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}