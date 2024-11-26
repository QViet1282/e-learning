/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: TeachingPage
   ========================================================================== */
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSwipeable } from 'react-swipeable'
import frankImg from '../../../assets/images/teaching/frank-1x-v2.jpg'
import pauloImg from '../../../assets/images/teaching/paulo-1x.jpg'
import deborahIng from '../../../assets/images/teaching/deborah-1x.jpg'
const TestimonialSlider = () => {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      name: t('teachingPage.TestimonialSlider.testimonial1.name'),
      title: t('teachingPage.TestimonialSlider.testimonial1.title'),
      quote: t('teachingPage.TestimonialSlider.testimonial1.quote'),
      image: frankImg
    },
    {
      name: t('teachingPage.TestimonialSlider.testimonial2.name'),
      title: t('teachingPage.TestimonialSlider.testimonial2.title'),
      quote: t('teachingPage.TestimonialSlider.testimonial2.quote'),
      image: pauloImg
    },
    {
      name: t('teachingPage.TestimonialSlider.testimonial3.name'),
      title: t('teachingPage.TestimonialSlider.testimonial3.title'),
      quote: t('teachingPage.TestimonialSlider.testimonial3.quote'),
      image: deborahIng
    }
  ]

  const handleNext = () => {
    if (currentIndex < testimonials.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    trackMouse: true // Enable mouse swipe on desktop
  })

  return (
    <div
      {...handlers}
      className="relative sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 mx-auto max-w-6xl"
    >
      <div className='px-10'>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <div className="flex justify-center px-2">
            <img
              src={testimonials[currentIndex].image}
              alt={testimonials[currentIndex].name}
              className="w-full h-auto rounded-lg"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col space-y-4">
               <p className="text-gray-700 text-lg text-justify px-2 min-h-72 ">{`"${testimonials[currentIndex].quote}"`}</p>
            <div className="mt-4">
              <p className="text-xl font-semibold px-2">{testimonials[currentIndex].name}</p>
              <p className="text-gray-500 px-2">{testimonials[currentIndex].title}</p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        {/* Prev Button */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-gray-400 rounded-full hover:bg-gray-500 transition"
          >
            <span className="text-xl">{'<'}</span>
          </button>
        )}

        {/* Next Button */}
        {currentIndex < testimonials.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-gray-400 rounded-full hover:bg-gray-500 transition"
          >
            <span className="text-xl">{'>'}</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default TestimonialSlider
