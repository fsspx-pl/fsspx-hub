import { CMSLink } from '@/_components/Link';
import { Header as HeaderType } from '@/payload-types'

const CloseIcon: React.FC = () => {
  return (
    <button className="navbar-close relative top-2">
      <svg
        className="h-6 w-6 text-black cursor-pointer"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        ></path>
      </svg>
    </button>
  )
}

export const MobileMenu: React.FC<
  Pick<HeaderType, 'navItems'> & { children: React.ReactNode; copyright: string } & {
    onClose: () => void
  }
> = ({ navItems, children, copyright, onClose }) => {
  return (
    <div className="absolute navbar-menu z-50">
      <div
        onClick={() => onClose()}
        className="navbar-backdrop fixed inset-0 bg-gray-800 opacity-25"
      ></div>
      <nav className="fixed top-0 left-0 bottom-0 flex flex-col w-full max-w-sm py-4 px-[24px] bg-white border-r overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <a href="#">{children}</a>
          <div onClick={() => onClose()}>
            <CloseIcon />
          </div>
        </div>
        <div className="flex flex-col items-start">
          {navItems?.map(({ link }, i) => {
            return (
              <CMSLink className="w-full !justify-start" key={i} {...link} />
            )
          })}
          {/* <li className="mb-1">
              <a
                className="block p-4 text-sm font-semibold text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded"
                href="#"
              >
                Home
              </a>
            </li> */}
        </div>
        <div className="mt-auto">
          <p className="my-4 text-xs text-center text-gray-400">
            <span>&copy; 2024 - {copyright}</span>
          </p>
        </div>
      </nav>
    </div>
  )
}
