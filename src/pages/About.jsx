import { Link } from 'react-router'
import { Flower, FriedEgg, Heart, Smiley, SockMonster, Sparkle, Squiggle, Star } from '../components/art/Doodles'
import SockArt from '../components/art/SockArt'
import GiantHeadline from '../components/GiantHeadline'
import Marquee from '../components/Marquee'
import ParallaxLayer from '../components/parallax/ParallaxLayer'
import ParallaxSection from '../components/parallax/ParallaxSection'
import StoryBlock from '../components/parallax/StoryBlock'
import Sticker from '../components/Sticker'

// ✎ PLACEHOLDER STORY — replace the copy below with the real socksavvy story.
// v2: the story is told in layers — giant type, sock cutouts and doodles on their planes,
// and every paragraph block enters at its own depth (StoryBlock).
export default function About() {
  return (
    <>
      <title>about — SOCKSAVVY</title>

      <ParallaxSection rest="top" aria-labelledby="about-title" className="tone-red clip-x relative pb-section pt-28 md:pt-36">
        <Sticker className="absolute right-[6%] top-[70px] z-20 w-24 md:right-[16%] md:w-40" rotate={12} depth="near">
          <SockMonster />
        </Sticker>
        <Sticker className="absolute bottom-[3%] right-[4%] z-20 w-24 md:w-40" rotate={-18} depth="near" delay={-2}>
          <SockArt art={{ pattern: 'eggs', base: '#111111', trim: '#f4d500' }} view="single" />
        </Sticker>
        <Sticker className="absolute left-[50%] top-[48%] hidden w-16 md:block" outline={false} rotate={-12}>
          <Star fill="#ffc6dd" />
        </Sticker>
        <ParallaxLayer as="span" depth="far" className="tag absolute left-[6%] top-[100px] text-yellow md:top-[130px]">thrifted</ParallaxLayer>
        <ParallaxLayer as="span" depth="back" className="tag absolute bottom-[8%] left-[40%] text-yellow">weird</ParallaxLayer>

        <GiantHeadline
          as="h1"
          id="about-title"
          lines={[
            { text: 'THE', from: 'right', className: 'pl-[34vw]' },
            { text: 'SOCK', from: 'left', className: 'pl-gutter' },
            { text: 'STORY', from: 'right', className: 'pl-[12vw] text-offwhite' },
          ]}
        />
        <div className="mt-10 px-gutter md:ml-[30%]">
          <StoryBlock depth="near">
            <p className="giant whitespace-normal text-display text-offwhite">it started with one very loud pair of fried-egg socks.</p>
          </StoryBlock>
          <StoryBlock depth="far" className="mt-5">
            <p className="copy">
              someone asked “where did you get those?” and the honest answer was “a market bin, under a pile of very boring socks.”
            </p>
          </StoryBlock>
          <StoryBlock depth="back" className="mt-2">
            <p className="copy copy-offset">
              so we went back. and back again. now we dig through bales, markets and closets every week so you don’t have to.
            </p>
          </StoryBlock>
        </div>
      </ParallaxSection>

      <Marquee className="tone-black" items={['THRIFTED', 'WASHED', 'HAND-PICKED', 'ONE OF ONE']} />

      <ParallaxSection aria-labelledby="thrift-title" className="tone-yellow clip-x relative py-section">
        <Sticker className="absolute right-[6%] top-[8%] z-20 w-20 md:w-32" rotate={-10} depth="near">
          <FriedEgg />
        </Sticker>
        <Sticker className="absolute bottom-[6%] right-[10%] w-12 md:w-16" outline={false} rotate={8}>
          <Flower fill="#ff52a1" center="#000" />
        </Sticker>
        {/* cutout on the front plane (placeholder for a real transparent photo cutout) */}
        <Sticker className="absolute -bottom-[6%] left-[4%] z-30 hidden w-36 md:block lg:w-44" depth="front" rotate={-14} delay={-3}>
          <SockArt art={{ pattern: 'checker', base: '#ffffff', trim: '#111111' }} view="single" />
        </Sticker>
        <GiantHeadline
          id="thrift-title"
          lines={[
            { text: 'THRIFTED,', from: 'left', className: 'pl-gutter' },
            { text: 'NOT TIRED', from: 'right', className: 'pl-[18vw]' },
          ]}
        />
        <div className="mt-10 grid gap-8 px-gutter md:grid-cols-2 lg:pr-28">
          <StoryBlock depth="far">
            <p className="copy">every pair is checked, washed and pressed by hand. if it has a hole, a stain or bad vibes, it doesn’t make the cut.</p>
          </StoryBlock>
          <StoryBlock depth="near" className="md:mt-20">
            <p className="copy">buying thrifted means one less pair in a landfill and one more weird pair on your feet. that’s the whole business plan.</p>
          </StoryBlock>
        </div>
      </ParallaxSection>

      <ParallaxSection aria-labelledby="one-title" className="tone-pink clip-x relative py-section">
        <Sticker className="absolute left-[60%] top-[6%] z-20 w-16 md:w-24" outline={false} rotate={-20}>
          <Squiggle />
        </Sticker>
        <Sticker className="absolute bottom-[8%] right-[8%] z-20 w-24 md:w-36" rotate={10} depth="near">
          <Smiley />
        </Sticker>
        <Sticker className="absolute bottom-[30%] left-[6%] z-20 hidden w-16 md:block" rotate={-12}>
          <Heart />
        </Sticker>
        <GiantHeadline
          id="one-title"
          lines={[
            { text: 'ONE OF', from: 'right', className: 'pl-[24vw]' },
            { text: 'ONE', from: 'left', className: 'pl-gutter' },
          ]}
        />
        <div className="mt-10 px-gutter md:ml-[34%]">
          <StoryBlock depth="near">
            <p className="copy">most pairs exist exactly once. no restocks, no reprints, no twins at the party.</p>
          </StoryBlock>
          <StoryBlock depth="far" className="mt-2">
            <p className="copy copy-offset">if you love a pair, don’t wait. someone in another city is looking at it too.</p>
          </StoryBlock>
        </div>
      </ParallaxSection>

      <ParallaxSection aria-labelledby="be-title" className="tone-green clip-x relative py-section">
        <Sticker className="absolute right-[8%] top-[10%] z-20 w-14 md:w-20" outline={false} rotate={10}>
          <Sparkle fill="#f4d500" />
        </Sticker>
        <GiantHeadline
          id="be-title"
          lines={[
            { text: 'BE UNIQUE,', from: 'left', className: 'pl-gutter' },
            { text: 'BE YOU', from: 'right', className: 'pl-[20vw] text-offwhite' },
          ]}
        />
        <div className="mt-10 flex flex-col items-start gap-6 px-gutter md:ml-[20%]">
          <StoryBlock depth="far">
            <p className="copy">shipped from our sock drawer to yours, anywhere in pakistan. cash on delivery, always.</p>
          </StoryBlock>
          <Link to="/shop" className="btn btn-yellow btn-lg">
            shop socks
          </Link>
        </div>
      </ParallaxSection>
    </>
  )
}
