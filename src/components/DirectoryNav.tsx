import type { Directory } from '@modules/terminal';

import { directories } from '@modules/terminal';

interface DirectoryNavProps {
  active: Directory;
  onSelect: (id: Directory) => void;
}

export function DirectoryNav({ active, onSelect }: DirectoryNavProps) {
  return (
    <nav className="mod-nav" aria-label="Modules">
      <p className="mod-nav__hint">
        <span className="tone-dim">SELECT DIRECTORY [← → or click or cd]</span>
      </p>
      <ul className="mod-nav__list">
        {directories.map((dir) => {
          const isActive = dir === active;
          return (
            <li key={dir}>
              <button
                type="button"
                className={`mod-nav__item${isActive ? ' is-active' : ''}`}
                onClick={() => onSelect(dir)}
                aria-current={isActive ? 'page' : undefined}
              >
                /{dir.toUpperCase()}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
