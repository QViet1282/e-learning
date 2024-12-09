/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-redeclare */
import React from 'react'
import Imgcontact from '../../assets/images/contact/BANNER.png'
import gmailIcon from '../../assets/images/contact/gmail_icon.png'
import messageIcon from '../../assets/images/contact/message.png'
import zaloIcon from '../../assets/images/contact/zalo_icon.png'
import phoneIcon from '../../assets/images/contact/phone_icon.png'
import { useTranslation } from 'react-i18next'

const ContactPage: React.FC = () => {
  const { t } = useTranslation()

  const contactMethods = [
    {
      icon: gmailIcon,
      label: 'Email',
      value: 'vietcode.team@gmail.com',
      link: 'mailto:vietcode.team@gmail.com'
    },
    {
      icon: messageIcon,
      label: 'Facebook',
      value: 'VIETCODE Page',
      link: 'https://m.me/100040439012224'
    },
    {
      icon: zaloIcon,
      label: 'Zalo',
      value: 'VIETCODE',
      link: 'https://zalo.me/0378992622'
    },
    {
      icon: phoneIcon,
      label: 'Phone',
      value: '0378 992 622',
      link: 'tel:0378992622'
    }
  ]

  return (
    <>
      {/* Phần banner */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4">
        <div className="relative">
          <img
            src={Imgcontact}
            alt="Banner"
            className="w-full object-cover"
            style={{ height: '250px' }}
          />
        </div>
      </div>
      <div className="bg-gray-50 p-6">
        <div className="bg-white p-4 sm:p-4 md:p-4 lg:p-8 xl:p-8 shadow-lg rounded-lg mb-8">
          {/* Phần liên hệ */}
          <>
            <h2 className="text-2xl font-bold mb-6">{t('contact.title')}</h2>
            <p className="mb-6">{t('contact.description')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactMethods.map((method, index) => (
                <a
                  href={method.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={index}
                  className="flex items-center bg-gray-50 p-4 rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
                >
                  <div>
                    <img src={method.icon} alt={method.label} className="w-8 h-8" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xs text-gray-500">{method.label}</h4>
                    <p className="text-sm font-semibold text-gray-900">
                      {method.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </>
          {/* Phần Google Maps */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">{t('contact.addressTitle')}</h2>
            <div className="w-full h-72 rounded-lg overflow-hidden">
              <iframe
                title="Google Maps"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.8582379826526!2d106.68427047588014!3d10.822158889329422!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174deb3ef536f31%3A0x8b7bb8b7c956157b!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2hp4buHcCBUUC5IQ00!5e0!3m2!1svi!2s!4v1731766147435!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ContactPage
