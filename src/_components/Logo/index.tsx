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
        <div className="hidden sm:flex relative top-[-6px]">
          <TextLogo
            width={163}
            height={26}
          />
        </div>
      )}
      <TwoHeartsLogo width={38} height={50} />
      <div id="title" className="flex flex-col text-sm leading-[1.1] relative top-[-21px] text-left">
        <span className={`font-light`}>Bractwo Kapłańskie</span>
        <span className={`font-medium`}>Świętego Piusa X</span>
      </div>
    </div>
  )
}
