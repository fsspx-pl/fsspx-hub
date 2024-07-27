import { Media } from '@/payload-types'
import { Gothic_A1 } from 'next/font/google'
import Image from 'next/image'

const gothicExtraLight = Gothic_A1({ weight: '200', subsets: ['latin'] })
const gothicMedium = Gothic_A1({ weight: '500', subsets: ['latin'] })

export const Logo = ({
  logo,
  textLogo,
  skipMainText,
}: {
  logo: Media
  textLogo?: Media
  skipMainText?: boolean
}) => {
  return (
    <>
      <div id="logo" className="flex flex-row gap-2 md:gap-4">
        <Image src={(logo as Media).url ?? ''} alt={(logo as Media).alt} width={34} height={45} />
        {!skipMainText && textLogo && (
          <Image
            src={(textLogo as Media).url ?? ''}
            alt={(textLogo as Media).alt}
            className="hidden md:block relative top-2"
            width={163}
            height={0}
          />
        )}
        <div id="title" className="flex flex-col text-sm leading-none relative top-[18px] text-left">
          <span className={gothicExtraLight.className}>Bractwo</span>
          <span className={gothicMedium.className}>św. Piusa X</span>
        </div>
      </div>
    </>
  )
}
