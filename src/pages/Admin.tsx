import { useState, useEffect, useCallback } from "react"
import Icon from "@/components/ui/icon"

const ADMIN_PASSWORD = "fsb2025"
const API = "https://functions.poehali.dev/126a864c-32fb-4472-8fa4-ac20130aec73"

type Tab = "dashboard" | "vacancies" | "applications" | "employees" | "settings"

interface Vacancy { id: number; title: string; category: string; format: string; status: string; created_at: string }
interface Application { id: number; name: string; email: string; position: string; message: string; status: string; created_at: string }
interface Employee { id: number; name: string; email: string; position: string; department: string; format: string; status: string; hired_at: string }

const statusLabels: Record<string, string> = { new: "Новая", review: "На рассмотрении", approved: "Одобрено", rejected: "Отклонено" }
const statusColors: Record<string, string> = {
  new: "text-yellow-400 bg-yellow-400/10",
  review: "text-blue-400 bg-blue-400/10",
  approved: "text-green-400 bg-green-400/10",
  rejected: "text-red-400 bg-red-400/10",
  active: "text-green-400 bg-green-400/10",
  fired: "text-red-400 bg-red-400/10",
}

function api(resource: string, method = "GET", params: Record<string, string> = {}, body?: object) {
  const qs = new URLSearchParams({ resource, ...params }).toString()
  return fetch(`${API}?${qs}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }).then(r => r.json())
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
}

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")

  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)

  const [showAddVacancy, setShowAddVacancy] = useState(false)
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [newVacancy, setNewVacancy] = useState({ title: "", category: "", format: "Удалённо" })
  const [newEmployee, setNewEmployee] = useState({ name: "", email: "", position: "", department: "", format: "Удалённо" })

  const loadAll = useCallback(async () => {
    setLoading(true)
    const [v, a, e] = await Promise.all([
      api("vacancies"),
      api("applications"),
      api("employees"),
    ])
    setVacancies(v)
    setApplications(a)
    setEmployees(e)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isLoggedIn) loadAll()
  }, [isLoggedIn, loadAll])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) { setIsLoggedIn(true); setPasswordError(false) }
    else setPasswordError(true)
  }

  const handleAddVacancy = async () => {
    if (!newVacancy.title || !newVacancy.category) return
    await api("vacancies", "POST", {}, newVacancy)
    setNewVacancy({ title: "", category: "", format: "Удалённо" })
    setShowAddVacancy(false)
    loadAll()
  }

  const handleDeleteVacancy = async (id: number) => {
    await api("vacancies", "DELETE", { id: String(id) })
    loadAll()
  }

  const handleApplicationStatus = async (id: number, status: string) => {
    await api("applications", "PUT", { id: String(id) }, { status })
    loadAll()
  }

  const handleDeleteApplication = async (id: number) => {
    await api("applications", "DELETE", { id: String(id) })
    loadAll()
  }

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.position) return
    await api("employees", "POST", {}, newEmployee)
    setNewEmployee({ name: "", email: "", position: "", department: "", format: "Удалённо" })
    setShowAddEmployee(false)
    loadAll()
  }

  const handleFireEmployee = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "fired" : "active"
    await api("employees", "PUT", { id: String(id) }, { status: newStatus })
    loadAll()
  }

  const handleDeleteEmployee = async (id: number) => {
    await api("employees", "DELETE", { id: String(id) })
    loadAll()
  }

  const stats = [
    { label: "Активных вакансий", value: vacancies.filter(v => v.status === "active").length, icon: "Briefcase" },
    { label: "Новых заявок", value: applications.filter(a => a.status === "new").length, icon: "FileText" },
    { label: "Сотрудников", value: employees.filter(e => e.status === "active").length, icon: "Users" },
    { label: "Одобрено", value: applications.filter(a => a.status === "approved").length, icon: "CheckCircle" },
  ]

  const NAV: { id: Tab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Сводка", icon: "LayoutDashboard" },
    { id: "vacancies", label: "Вакансии", icon: "Briefcase" },
    { id: "applications", label: "Заявки", icon: "FileText" },
    { id: "employees", label: "Сотрудники", icon: "Users" },
    { id: "settings", label: "Настройки", icon: "Settings" },
  ]

  const bg = "bg-[hsl(220,40%,6%)]"
  const card = "bg-[hsl(220,38%,9%)]"
  const border = "border-[hsl(220,30%,16%)]"
  const fg = "text-[hsl(45,20%,94%)]"
  const gold = "text-[hsl(43,74%,52%)]"
  const goldBg = "bg-[hsl(43,74%,52%)]"
  const muted = "text-[hsl(45,20%,94%)]/50"
  const inputCls = `w-full border ${border} ${card} px-3 py-2 font-sans text-sm ${fg} focus:border-[hsl(43,74%,52%)] focus:outline-none`

  if (!isLoggedIn) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${bg}`}>
        <div className="w-full max-w-sm px-4">
          <div className="mb-8 text-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e6/Emblem_of_Federal_security_service.svg" alt="Герб ФСБ" className="mx-auto mb-4 h-20 w-auto opacity-90" />
            <h1 className={`font-serif text-2xl font-normal ${fg}`}>Панель управления</h1>
            <p className={`mt-1 font-mono text-xs uppercase tracking-widest ${muted}`}>ФСБ Remote · Служебный доступ</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={`mb-2 block font-mono text-xs uppercase tracking-widest ${muted}`}>Пароль доступа</label>
              <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setPasswordError(false) }}
                className={`w-full border ${border} ${card} px-4 py-3 font-mono text-sm ${fg} placeholder:${muted} focus:border-[hsl(43,74%,52%)] focus:outline-none`}
                placeholder="Введите пароль" autoFocus />
              {passwordError && <p className="mt-2 font-mono text-xs text-red-400">Неверный пароль. Доступ запрещён.</p>}
            </div>
            <button type="submit" className={`w-full ${goldBg} px-4 py-3 font-sans text-sm font-bold uppercase tracking-widest text-[hsl(220,40%,6%)] transition-opacity hover:opacity-90`}>Войти</button>
          </form>
          <p className={`mt-6 text-center font-mono text-xs ${muted}`}>Подсказка: fsb2025</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex min-h-screen ${bg} ${fg}`}>
      {/* Sidebar */}
      <aside className={`flex w-64 shrink-0 flex-col border-r ${border} ${card}`}>
        <div className={`flex items-center gap-3 border-b ${border} px-5 py-5`}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/e/e6/Emblem_of_Federal_security_service.svg" alt="Герб ФСБ" className="h-10 w-auto opacity-90" />
          <div>
            <div className="font-serif text-base font-normal">ФСБ Remote</div>
            <div className={`font-mono text-[10px] uppercase tracking-widest ${muted}`}>Администратор</div>
          </div>
        </div>
        <nav className="flex-1 p-3">
          {NAV.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`mb-1 flex w-full items-center gap-3 px-3 py-2.5 text-left font-sans text-sm transition-colors ${activeTab === item.id ? `bg-[hsl(43,74%,52%)]/15 ${gold}` : `${muted} hover:bg-[hsl(220,30%,16%)] hover:${fg}`}`}>
              <Icon name={item.icon} fallback="Circle" size={16} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className={`border-t ${border} p-3`}>
          <button onClick={() => setIsLoggedIn(false)} className={`flex w-full items-center gap-3 px-3 py-2.5 font-sans text-sm ${muted} transition-colors hover:text-red-400`}>
            <Icon name="LogOut" size={16} />Выйти
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className={`border-b ${border} px-8 py-5`}>
          <h1 className="font-serif text-2xl font-normal">
            {activeTab === "dashboard" && "Сводка"}
            {activeTab === "vacancies" && "Управление вакансиями"}
            {activeTab === "applications" && "Входящие заявки"}
            {activeTab === "employees" && "Сотрудники"}
            {activeTab === "settings" && "Настройки сайта"}
          </h1>
          <p className={`font-mono text-xs ${muted}`}>{new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>

        <div className="p-8">
          {loading && <p className={`font-mono text-sm ${muted}`}>Загрузка...</p>}

          {/* Dashboard */}
          {activeTab === "dashboard" && !loading && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className={`border ${border} ${card} p-5`}>
                    <div className={`mb-3 flex items-center gap-2 ${muted}`}>
                      <Icon name={stat.icon} fallback="Circle" size={14} />
                      <span className="font-mono text-xs uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <div className={`font-serif text-4xl font-normal ${gold}`}>{stat.value}</div>
                  </div>
                ))}
              </div>
              <div className={`border ${border} ${card} p-6`}>
                <h2 className="mb-4 font-serif text-lg">Последние заявки</h2>
                <div className="space-y-3">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className={`flex items-center justify-between border-b ${border} pb-3`}>
                      <div>
                        <div className="font-sans text-sm">{app.name}</div>
                        <div className={`font-mono text-xs ${muted}`}>{app.position} · {formatDate(app.created_at)}</div>
                      </div>
                      <span className={`rounded px-2 py-0.5 font-mono text-xs ${statusColors[app.status] || ""}`}>{statusLabels[app.status]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Vacancies */}
          {activeTab === "vacancies" && !loading && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => setShowAddVacancy(true)} className={`flex items-center gap-2 ${goldBg} px-4 py-2 font-sans text-sm font-bold text-[hsl(220,40%,6%)] transition-opacity hover:opacity-90`}>
                  <Icon name="Plus" size={14} />Добавить вакансию
                </button>
              </div>
              {showAddVacancy && (
                <div className={`border border-[hsl(43,74%,52%)]/30 ${card} p-5`}>
                  <h3 className="mb-4 font-serif text-base">Новая вакансия</h3>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div><label className={`mb-1 block font-mono text-xs ${muted}`}>Должность</label>
                      <input className={inputCls} value={newVacancy.title} onChange={e => setNewVacancy({ ...newVacancy, title: e.target.value })} placeholder="Название должности" /></div>
                    <div><label className={`mb-1 block font-mono text-xs ${muted}`}>Направление</label>
                      <input className={inputCls} value={newVacancy.category} onChange={e => setNewVacancy({ ...newVacancy, category: e.target.value })} placeholder="Отдел / направление" /></div>
                    <div><label className={`mb-1 block font-mono text-xs ${muted}`}>Формат</label>
                      <select className={inputCls} value={newVacancy.format} onChange={e => setNewVacancy({ ...newVacancy, format: e.target.value })}>
                        <option>Удалённо</option><option>Гибрид</option><option>В офисе</option>
                      </select></div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={handleAddVacancy} className={`${goldBg} px-4 py-2 font-sans text-sm font-bold text-[hsl(220,40%,6%)] hover:opacity-90`}>Сохранить</button>
                    <button onClick={() => setShowAddVacancy(false)} className={`border ${border} px-4 py-2 font-sans text-sm ${muted} hover:${fg}`}>Отмена</button>
                  </div>
                </div>
              )}
              <div className={`border ${border} ${card}`}>
                {vacancies.length === 0 && <p className={`px-5 py-4 font-mono text-sm ${muted}`}>Вакансий нет</p>}
                {vacancies.map((v, i) => (
                  <div key={v.id} className={`flex items-center justify-between px-5 py-4 ${i !== 0 ? `border-t ${border}` : ""}`}>
                    <div>
                      <div className="font-sans text-sm font-medium">{v.title}</div>
                      <div className={`font-mono text-xs ${muted}`}>{v.category} · {v.format}</div>
                    </div>
                    <button onClick={() => handleDeleteVacancy(v.id)} className={`${muted} transition-colors hover:text-red-400`}>
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Applications */}
          {activeTab === "applications" && !loading && (
            <div className={`border ${border} ${card}`}>
              {applications.length === 0 && <p className={`px-5 py-4 font-mono text-sm ${muted}`}>Заявок нет</p>}
              {applications.map((app, i) => (
                <div key={app.id} className={`flex flex-wrap items-start justify-between gap-4 px-5 py-4 ${i !== 0 ? `border-t ${border}` : ""}`}>
                  <div>
                    <div className="font-sans text-sm font-medium">{app.name}</div>
                    <div className={`font-mono text-xs ${muted}`}>{app.email} · {app.position}</div>
                    {app.message && <div className={`mt-1 max-w-sm font-mono text-xs ${muted} italic`}>{app.message}</div>}
                    <div className={`font-mono text-xs text-[hsl(45,20%,94%)]/30`}>{formatDate(app.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded px-2 py-0.5 font-mono text-xs ${statusColors[app.status] || ""}`}>{statusLabels[app.status]}</span>
                    <select value={app.status} onChange={e => handleApplicationStatus(app.id, e.target.value)}
                      className={`border ${border} ${bg} px-2 py-1 font-mono text-xs ${fg} focus:outline-none`}>
                      <option value="new">Новая</option>
                      <option value="review">На рассмотрении</option>
                      <option value="approved">Одобрить</option>
                      <option value="rejected">Отклонить</option>
                    </select>
                    <button onClick={() => handleDeleteApplication(app.id)} className={`${muted} transition-colors hover:text-red-400`}>
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Employees */}
          {activeTab === "employees" && !loading && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => setShowAddEmployee(true)} className={`flex items-center gap-2 ${goldBg} px-4 py-2 font-sans text-sm font-bold text-[hsl(220,40%,6%)] transition-opacity hover:opacity-90`}>
                  <Icon name="UserPlus" size={14} />Нанять сотрудника
                </button>
              </div>
              {showAddEmployee && (
                <div className={`border border-[hsl(43,74%,52%)]/30 ${card} p-5`}>
                  <h3 className="mb-4 font-serif text-base">Новый сотрудник</h3>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <div><label className={`mb-1 block font-mono text-xs ${muted}`}>ФИО</label>
                      <input className={inputCls} value={newEmployee.name} onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })} placeholder="Иванов Иван Иванович" /></div>
                    <div><label className={`mb-1 block font-mono text-xs ${muted}`}>Email</label>
                      <input className={inputCls} value={newEmployee.email} onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })} placeholder="ivanov@fsb.ru" /></div>
                    <div><label className={`mb-1 block font-mono text-xs ${muted}`}>Должность</label>
                      <input className={inputCls} value={newEmployee.position} onChange={e => setNewEmployee({ ...newEmployee, position: e.target.value })} placeholder="Аналитик" /></div>
                    <div><label className={`mb-1 block font-mono text-xs ${muted}`}>Отдел</label>
                      <input className={inputCls} value={newEmployee.department} onChange={e => setNewEmployee({ ...newEmployee, department: e.target.value })} placeholder="Отдел безопасности" /></div>
                    <div><label className={`mb-1 block font-mono text-xs ${muted}`}>Формат</label>
                      <select className={inputCls} value={newEmployee.format} onChange={e => setNewEmployee({ ...newEmployee, format: e.target.value })}>
                        <option>Удалённо</option><option>Гибрид</option><option>В офисе</option>
                      </select></div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={handleAddEmployee} className={`${goldBg} px-4 py-2 font-sans text-sm font-bold text-[hsl(220,40%,6%)] hover:opacity-90`}>Принять на службу</button>
                    <button onClick={() => setShowAddEmployee(false)} className={`border ${border} px-4 py-2 font-sans text-sm ${muted}`}>Отмена</button>
                  </div>
                </div>
              )}
              <div className={`border ${border} ${card}`}>
                {employees.length === 0 && <p className={`px-5 py-4 font-mono text-sm ${muted}`}>Сотрудников нет</p>}
                {employees.map((emp, i) => (
                  <div key={emp.id} className={`flex flex-wrap items-center justify-between gap-4 px-5 py-4 ${i !== 0 ? `border-t ${border}` : ""}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-sm font-medium">{emp.name}</span>
                        <span className={`rounded px-2 py-0.5 font-mono text-xs ${statusColors[emp.status] || ""}`}>
                          {emp.status === "active" ? "Активен" : "Уволен"}
                        </span>
                      </div>
                      <div className={`font-mono text-xs ${muted}`}>{emp.position} · {emp.department} · {emp.format}</div>
                      <div className={`font-mono text-xs text-[hsl(45,20%,94%)]/30`}>Принят: {formatDate(emp.hired_at)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleFireEmployee(emp.id, emp.status)}
                        className={`flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs transition-colors ${emp.status === "active" ? `border-red-400/30 text-red-400 hover:bg-red-400/10` : `border-green-400/30 text-green-400 hover:bg-green-400/10`}`}>
                        <Icon name={emp.status === "active" ? "UserMinus" : "UserCheck"} size={12} />
                        {emp.status === "active" ? "Уволить" : "Восстановить"}
                      </button>
                      <button onClick={() => handleDeleteEmployee(emp.id)} className={`${muted} transition-colors hover:text-red-400`}>
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="max-w-lg space-y-6">
              <div className={`border ${border} ${card} p-5`}>
                <h3 className="mb-4 font-serif text-base">Контактные данные</h3>
                <div className="space-y-3">
                  {[{ label: "Email для заявок", value: "info@fsb-remote.gov.ru" }, { label: "Телефон", value: "+7 (800) 000-00-00" }, { label: "Адрес", value: "Россия, все регионы" }].map((field) => (
                    <div key={field.label}>
                      <label className={`mb-1 block font-mono text-xs ${muted}`}>{field.label}</label>
                      <input type="text" defaultValue={field.value} className={inputCls} />
                    </div>
                  ))}
                  <button className={`mt-2 ${goldBg} px-4 py-2 font-sans text-sm font-bold text-[hsl(220,40%,6%)] hover:opacity-90`}>Сохранить</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
