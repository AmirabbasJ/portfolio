import { modules, type ModuleId } from '../terminal/system'

type ModuleNavProps = {
  active: ModuleId
  onSelect: (id: ModuleId) => void
}

export function ModuleNav({ active, onSelect }: ModuleNavProps) {
  return (
    <nav className="mod-nav" aria-label="Modules">
      <p className="mod-nav__hint">
        <span className="tone-accent">root@aj/nav</span>
        <span className="tone-dim"> &gt; SELECT MODULE [← → or click]</span>
      </p>
      <ul className="mod-nav__list">
        {modules.map((mod) => {
          const isActive = mod.id === active
          return (
            <li key={mod.id}>
              <button
                type="button"
                className={`mod-nav__item${isActive ? ' is-active' : ''}`}
                onClick={() => onSelect(mod.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive ? '> ' : '  '}
                {mod.index}._{mod.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
