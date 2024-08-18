/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* LAYOUT FOOTER COMPONENT
   ========================================================================== */

import React from 'react'
import { useTranslation } from 'react-i18next'
import FacebookIcon from '@mui/icons-material/Facebook'
import TwitterIcon from '@mui/icons-material/Twitter'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import InstagramIcon from '@mui/icons-material/Instagram'

const Footer = () => {
  const { t } = useTranslation()

  return (
       <footer className='bg-gray-900 text-gray-300 py-10'>
         <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">

           <div>
             <h3 className="text-lg font-semibold mb-4">{t('footer.about_us')}</h3>
             <p>{t('footer.about_us_text')}</p>
           </div>

           <div>
             <h3 className="text-lg font-semibold mb-4">{t('footer.quick_links')}</h3>
             <ul>
               <li className="mb-2 hover:text-white"><a href="/about-us">{t('footer.about_us')}</a></li>
               <li className="mb-2 hover:text-white"><a href="/services">{t('footer.services')}</a></li>
               <li className="mb-2 hover:text-white"><a href="/contact">{t('footer.contact')}</a></li>
               <li className="mb-2 hover:text-white"><a href="/privacy-policy">{t('footer.privacy_policy')}</a></li>
             </ul>
           </div>

           <div>
             <h3 className="text-lg font-semibold mb-4">{t('footer.follow_us')}</h3>
             <div className="flex space-x-4">
               <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                 <FacebookIcon />
               </a>
               <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                 <TwitterIcon />
               </a>
               <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                 <LinkedInIcon />
               </a>
               <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                 <InstagramIcon />
               </a>
             </div>
           </div>

         </div>
         <div className="text-center mt-8 border-t border-gray-700 pt-4">
           &copy; 2024 Your Company Name. {t('footer.rights_reserved')}
         </div>
       </footer>
  )
}

export default Footer