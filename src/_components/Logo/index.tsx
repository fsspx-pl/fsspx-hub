import TextLogo from './fsspx.svg'
import TwoHeartsLogo from './two-hearts-logo.svg'

export const Logo = ({
  skipMainText,
}: {
  skipMainText?: boolean
}) => {
  return (
    <div id="logo" className="flex flex-row gap-4 items-baseline">
      {!skipMainText && (
        <div className="hidden sm:flex">
          <TextLogo
            width={163}
            height={26}
          />
        </div>
      )}
      <TwoHeartsLogo width={34} height={45} />
      <div id="title" className="flex flex-col text-sm leading-none relative top-[-15px] text-left">
        <span className={`font-light`}>Bractwo Kapłańskie</span>
        <span className={`font-medium`}>Świętego Piusa X</span>
      </div>
    </div>
  )
}
