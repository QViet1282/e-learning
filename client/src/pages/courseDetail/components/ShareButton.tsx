/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
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
import ShareIcon from '@mui/icons-material/Share'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

const ShareButton = () => {
  const { t } = useTranslation()

  const handleCopyLink = () => {
    const link = window.location.href // Lấy URL hiện tại
    navigator.clipboard.writeText(link).then(() => {
      toast.success(t('course_detail.link_copied')) // Hiển thị thông báo khi sao chép thành công
    }).catch(err => {
      console.error('Failed to copy: ', err)
    })
  }

  return (
    <button
      className='text-red-400 flex-1 border border-red-400 rounded-3xl p-2 text-sm hover:bg-red-400 hover:text-white transition-colors duration-200 font-bold'
      onClick={handleCopyLink}
    >
      <ShareIcon className='mr-2' />
      {t('course_detail.share')}
    </button>
  )
}

export default ShareButton
