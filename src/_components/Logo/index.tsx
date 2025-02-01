import { Gothic_A1 } from 'next/font/google'
import TextLogo from './fsspx.svg'
import TwoHeartsLogo from './two-hearts-logo.svg'


const gothicExtraLight = Gothic_A1({ weight: '200', subsets: ['latin'] })
const gothicMedium = Gothic_A1({ weight: '500', subsets: ['latin'] })

export const Logo = ({
  skipMainText,
}: {
  skipMainText?: boolean
}) => {
  return (
    <div id="logo" className="flex flex-row gap-2 items-baseline md:gap-4">
      <TwoHeartsLogo width={34} height={45} />
      {!skipMainText && (
        <div className="hidden sm:flex">
          <TextLogo
            width={163}
            height={26}
          />
        </div>
      )}
      <div id="title" className="flex flex-col text-sm leading-none relative top-[-15px] text-left">
        <span className={gothicExtraLight.className}>Bractwo</span>
        <span className={gothicMedium.className}>św. Piusa X</span>
      </div>
    </div>
  )
}
